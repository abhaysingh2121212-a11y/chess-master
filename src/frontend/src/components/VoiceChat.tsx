import { Button } from "@/components/ui/button";
import { AlertCircle, Mic, MicOff, PhoneCall, PhoneOff } from "lucide-react";
import { useVoiceChat } from "../hooks/useVoiceChat";

type Props = {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  active: boolean;
};

export function VoiceChat({ roomCode, playerId, isHost, active }: Props) {
  const { status, isMuted, toggleMute } = useVoiceChat(
    roomCode,
    playerId,
    isHost,
    active,
  );

  const statusColor =
    status === "connected"
      ? "text-green-400"
      : status === "connecting"
        ? "text-yellow-400"
        : status === "denied"
          ? "text-red-400"
          : "text-muted-foreground";

  const statusLabel =
    status === "connected"
      ? "Connected"
      : status === "connecting"
        ? "Connecting..."
        : status === "denied"
          ? "Mic denied"
          : status === "disconnected"
            ? "Disconnected"
            : "Voice Chat";

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 border border-border">
      {status === "denied" ? (
        <AlertCircle className="w-4 h-4 text-red-400" />
      ) : status === "connected" ? (
        <PhoneCall className="w-4 h-4 text-green-400" />
      ) : (
        <PhoneOff className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={`text-xs flex-1 ${statusColor}`}>{statusLabel}</span>
      {status !== "denied" && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          data-ocid="voice.toggle"
        >
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
