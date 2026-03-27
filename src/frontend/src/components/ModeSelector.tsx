import { Bot, Users, Wifi } from "lucide-react";
import type React from "react";

export type GameMode = "pvp" | "bot" | "online";

type Props = {
  onSelect: (mode: GameMode) => void;
  visible: boolean;
};

const modes: {
  id: GameMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "pvp",
    label: "Play Offline",
    desc: "Two players, one device",
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: "bot",
    label: "Play vs Bot",
    desc: "Challenge Stockfish AI",
    icon: <Bot className="w-6 h-6" />,
  },
  {
    id: "online",
    label: "Play Online",
    desc: "Play with a friend online",
    icon: <Wifi className="w-6 h-6" />,
  },
];

export function ModeSelector({ onSelect, visible }: Props) {
  return (
    <div
      className={`mode-overlay absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 rounded-sm ${
        visible ? "" : "hidden"
      }`}
      style={{
        background: "rgba(12, 12, 18, 0.88)",
        backdropFilter: "blur(8px)",
      }}
    >
      <h1 className="font-display text-3xl font-bold text-foreground mb-1 tracking-tight">
        Chess Master
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Choose your game mode
      </p>
      {modes.map((m) => (
        <button
          type="button"
          key={m.id}
          data-ocid={`mode.${m.id}.button`}
          onClick={() => onSelect(m.id)}
          className="w-full max-w-xs flex items-center gap-4 px-5 py-4 rounded-lg border border-border bg-card/80 hover:bg-accent/20 hover:border-primary/60 transition-all duration-200 text-left group"
        >
          <span className="text-primary group-hover:scale-110 transition-transform duration-200">
            {m.icon}
          </span>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {m.label}
            </div>
            <div className="text-muted-foreground text-xs">{m.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
