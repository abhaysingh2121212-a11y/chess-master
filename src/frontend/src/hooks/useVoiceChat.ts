import { useCallback, useEffect, useRef, useState } from "react";
import type { Signal } from "../backend";
import { useActor } from "./useActor";

export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "denied";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export function useVoiceChat(
  roomCode: string,
  playerId: string,
  isHost: boolean,
  active: boolean,
) {
  const { actor } = useActor();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processedSignals = useRef<Set<string>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
    }
    streamRef.current = null;
  }, []);

  const postSignal = useCallback(
    async (type: string, data: string) => {
      if (!actor) return;
      await actor.postSignal(roomCode, playerId, type, data);
    },
    [actor, roomCode, playerId],
  );

  const handleSignal = useCallback(
    async (signal: Signal, pc: RTCPeerConnection) => {
      const key = `${signal.from}-${signal.signalType}-${signal.timestamp.toString()}`;
      if (processedSignals.current.has(key)) return;
      processedSignals.current.add(key);
      if (signal.from === playerId) return;

      if (signal.signalType === "offer" && !isHost) {
        const offer: RTCSessionDescriptionInit = JSON.parse(signal.data);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal("answer", JSON.stringify(answer));
      } else if (signal.signalType === "answer" && isHost) {
        const answer: RTCSessionDescriptionInit = JSON.parse(signal.data);
        await pc.setRemoteDescription(answer);
      } else if (signal.signalType === "ice") {
        const candidate = JSON.parse(signal.data);
        try {
          await pc.addIceCandidate(candidate);
        } catch {
          // ignore
        }
      }
    },
    [isHost, playerId, postSignal],
  );

  const startVoice = useCallback(async () => {
    if (!active || !roomCode || !actor) return;
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      for (const t of stream.getTracks()) pc.addTrack(t, stream);

      pc.ontrack = (e) => {
        const audio = document.createElement("audio");
        audio.srcObject = e.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) postSignal("ice", JSON.stringify(e.candidate));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("connected");
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          setStatus("disconnected");
        }
      };

      if (isHost) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal("offer", JSON.stringify(offer));
      }

      pollingRef.current = setInterval(async () => {
        const result = await actor.getRoom(roomCode);
        const room = result.length > 0 ? result[0] : null;
        if (!room) return;
        for (const signal of room.signals) {
          await handleSignal(signal, pc);
        }
      }, 2000);
    } catch (e: any) {
      if (e?.name === "NotAllowedError") setStatus("denied");
      else setStatus("disconnected");
    }
  }, [active, roomCode, actor, isHost, postSignal, handleSignal]);

  const toggleMute = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (active && roomCode && status === "idle") {
      startVoice();
    }
    return cleanup;
  }, [active, roomCode]);

  return { status, isMuted, toggleMute };
}
