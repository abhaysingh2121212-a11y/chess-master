import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  state: string;
  roomCode: string;
  error: string;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
};

export function OnlineSetup({
  state,
  roomCode,
  error,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: Props) {
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "waiting") {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <h2 className="font-display text-xl font-bold">
          Waiting for opponent...
        </h2>
        <p className="text-muted-foreground text-sm">Share this room code:</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold tracking-widest text-primary">
            {roomCode}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            data-ocid="online.copy.button"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm text-muted-foreground">Waiting...</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          data-ocid="online.back.button"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <h2 className="font-display text-xl font-bold">Online Multiplayer</h2>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button
        className="w-full max-w-xs"
        onClick={onCreateRoom}
        disabled={state === "hosting"}
        data-ocid="online.create.button"
      >
        Create Room
      </Button>
      <div className="flex items-center gap-2 w-full max-w-xs">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex gap-2 w-full max-w-xs">
        <Input
          placeholder="Enter room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="font-mono tracking-widest text-center"
          data-ocid="online.code.input"
        />
        <Button
          onClick={() => onJoinRoom(joinCode)}
          disabled={joinCode.length < 4}
          data-ocid="online.join.button"
        >
          Join
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        data-ocid="online.back.button"
      >
        ← Back
      </Button>
    </div>
  );
}
