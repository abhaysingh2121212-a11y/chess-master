import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomInfo } from "../backend";
import { useActor } from "./useActor";

export type OnlineState =
  | "idle"
  | "hosting"
  | "joining"
  | "waiting"
  | "playing"
  | "finished";

export function useOnlineRoom() {
  const { actor } = useActor();
  const [state, setState] = useState<OnlineState>("idle");
  const [roomCode, setRoomCode] = useState("");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [error, setError] = useState("");
  const playerId = useRef(crypto.randomUUID());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localMoveCount = useRef(0);
  const onOpponentMoveRef = useRef<((fen: string) => void) | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (code: string) => {
      stopPolling();
      pollingRef.current = setInterval(async () => {
        if (!actor) return;
        const result = await actor.getRoom(code);
        const room = result.length > 0 ? result[0] : null;
        if (!room) return;
        setRoomInfo(room);
        if (room.status === "finished") {
          setState("finished");
          stopPolling();
          return;
        }
        // guest joined
        if (state === "waiting" && room.guestId.length > 0) {
          setState("playing");
        }
        // check for opponent move
        const totalMoves = room.moves.length;
        if (totalMoves > localMoveCount.current) {
          const latestFen = room.moves[totalMoves - 1];
          localMoveCount.current = totalMoves;
          if (onOpponentMoveRef.current) {
            onOpponentMoveRef.current(latestFen);
          }
        }
      }, 1500);
    },
    [actor, state, stopPolling],
  );

  const createRoom = useCallback(async () => {
    if (!actor) {
      setError("Not connected");
      return;
    }
    setState("hosting");
    setError("");
    try {
      const code = await actor.createRoom(playerId.current);
      setRoomCode(code);
      setPlayerColor("w");
      localMoveCount.current = 0;
      setState("waiting");
      startPolling(code);
    } catch {
      setError("Failed to create room");
      setState("idle");
    }
  }, [actor, startPolling]);

  const joinRoom = useCallback(
    async (code: string) => {
      if (!actor) {
        setError("Not connected");
        return;
      }
      setState("joining");
      setError("");
      try {
        const ok = await actor.joinRoom(code, playerId.current);
        if (!ok) {
          setError("Room not found or full");
          setState("idle");
          return;
        }
        setRoomCode(code);
        setPlayerColor("b");
        localMoveCount.current = 0;
        // get initial state
        const result = await actor.getRoom(code);
        const room = result.length > 0 ? result[0] : null;
        if (room) {
          setRoomInfo(room);
          localMoveCount.current = room.moves.length;
        }
        setState("playing");
        startPolling(code);
      } catch {
        setError("Failed to join room");
        setState("idle");
      }
    },
    [actor, startPolling],
  );

  const sendMove = useCallback(
    async (fen: string, san: string) => {
      if (!actor || !roomCode) return;
      localMoveCount.current += 1;
      await actor.pushMove(roomCode, fen, san);
    },
    [actor, roomCode],
  );

  const setOpponentMoveHandler = useCallback(
    (handler: (fen: string) => void) => {
      onOpponentMoveRef.current = handler;
    },
    [],
  );

  const leaveRoom = useCallback(() => {
    stopPolling();
    if (actor && roomCode) actor.setFinished(roomCode).catch(() => {});
    setState("idle");
    setRoomCode("");
    setRoomInfo(null);
    localMoveCount.current = 0;
  }, [actor, roomCode, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  // suppress unused warning for roomInfo
  void roomInfo;

  return {
    state,
    roomCode,
    playerColor,
    roomInfo,
    error,
    playerId: playerId.current,
    createRoom,
    joinRoom,
    sendMove,
    setOpponentMoveHandler,
    leaveRoom,
  };
}
