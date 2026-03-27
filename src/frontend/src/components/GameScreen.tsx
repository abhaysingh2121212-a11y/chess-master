import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Chess } from "chess.js";
import {
  ArrowLeft,
  Cpu,
  Loader2,
  RotateCcw,
  Undo2,
  Users,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useChessGame } from "../hooks/useChessGame";
import { useOnlineRoom } from "../hooks/useOnlineRoom";
import { useStockfish } from "../hooks/useStockfish";
import { ChessBoard } from "./ChessBoard";
import type { GameMode } from "./ModeSelector";
import { ProfileMenu } from "./ProfileMenu";
import { VoiceChat } from "./VoiceChat";

type Props = {
  mode: GameMode;
  onBack: () => void;
};

const MODE_LABELS: Record<GameMode, string> = {
  pvp: "Player vs Player",
  bot: "Player vs Bot",
  online: "Online Multiplayer",
};

const MODE_ICONS: Record<GameMode, React.ReactNode> = {
  pvp: <Users className="w-4 h-4" />,
  bot: <Cpu className="w-4 h-4" />,
  online: <Wifi className="w-4 h-4" />,
};

export function GameScreen({ mode, onBack }: Props) {
  const game = useChessGame();
  const [botLevel, setBotLevel] = useState(5);
  const isBot = mode === "bot";
  const isOnline = mode === "online";
  const { getBestMove, isThinking } = useStockfish(botLevel, isBot);
  const online = useOnlineRoom();

  // Determine check square
  const chess = new Chess(game.fen);
  let checkSquare: string | null = null;
  if (chess.isCheck()) {
    const board = chess.board();
    outer: for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === "k" && p.color === chess.turn()) {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          checkSquare = `${files[f]}${8 - r}`;
          break outer;
        }
      }
    }
  }

  // Bot AI
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional selective deps
  useEffect(() => {
    if (!isBot || game.isGameOver) return;
    if (game.turn !== "b") return;
    const timeout = setTimeout(async () => {
      const move = await getBestMove(game.fen);
      if (move && move.length >= 4) {
        game.makeMove(move.slice(0, 2), move.slice(2, 4), move[4] || "q");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [isBot, game.fen, game.turn, game.isGameOver]);

  // Online: handle opponent moves
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional selective deps
  useEffect(() => {
    if (!isOnline) return;
    online.setOpponentMoveHandler((fen: string) => {
      game.loadFen(fen);
    });
  }, [isOnline]);

  const handleSquareClick = useCallback(
    (sq: string) => {
      if (game.isGameOver) return;
      if (isOnline) {
        const isMyTurn = online.playerColor === game.turn;
        if (!isMyTurn) return;
      }
      if (isBot && game.turn === "b") return;

      if (game.selectedSquare) {
        if (game.legalMoves.includes(sq)) {
          const san = game.makeMove(game.selectedSquare, sq);
          if (san && isOnline) {
            online.sendMove(game.chess.fen(), san);
          }
        } else {
          game.selectSquare(sq);
        }
      } else {
        game.selectSquare(sq);
      }
    },
    [game, isOnline, isBot, online],
  );

  const statusBadge = () => {
    if (game.status === "checkmate")
      return <Badge variant="destructive">Checkmate!</Badge>;
    if (game.status === "stalemate")
      return <Badge variant="secondary">Stalemate</Badge>;
    if (game.status === "draw") return <Badge variant="secondary">Draw</Badge>;
    if (game.status === "check")
      return <Badge className="bg-orange-500 text-white">Check!</Badge>;
    return null;
  };

  const turnLabel = () => {
    if (game.isGameOver) {
      if (game.status === "checkmate") {
        const winner = game.turn === "w" ? "Black" : "White";
        return `${winner} wins!`;
      }
      return "Game over";
    }
    if (isOnline && online.state === "waiting")
      return "Waiting for opponent...";
    return game.turn === "w" ? "White's turn" : "Black's turn";
  };

  const flipped = isOnline && online.playerColor === "b";

  const pairedMoves: { white?: string; black?: string; n: number }[] = [];
  game.history.forEach((m, i) => {
    if (i % 2 === 0)
      pairedMoves.push({ white: m.san, n: Math.floor(i / 2) + 1 });
    else pairedMoves[pairedMoves.length - 1].black = m.san;
  });

  const boardDisabled =
    game.isGameOver ||
    (isBot && game.turn === "b") ||
    (isOnline && online.playerColor !== game.turn) ||
    (isOnline && online.state === "waiting");

  return (
    <div
      className="flex flex-col h-screen bg-background"
      data-ocid="game.panel"
    >
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="game.back.button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Menu
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {MODE_ICONS[mode]}
          <span>{MODE_LABELS[mode]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={game.resetGame}
            data-ocid="game.restart.button"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restart
          </Button>
          <ProfileMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <main className="flex-1 flex items-center justify-center p-3 lg:p-6">
          <div
            className="w-full"
            style={{ maxWidth: "min(80vh, 100vw - 16px)" }}
          >
            <ChessBoard
              fen={game.fen}
              selectedSquare={game.selectedSquare}
              legalMoves={game.legalMoves}
              lastMove={game.lastMove}
              checkSquare={checkSquare}
              flipped={flipped}
              onSquareClick={handleSquareClick}
              disabled={boardDisabled}
            />
          </div>
        </main>

        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card/40 flex flex-col p-3 gap-3 overflow-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{turnLabel()}</span>
            {statusBadge()}
          </div>

          {isOnline && online.roomCode && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/40 border border-border">
              <span className="text-xs text-muted-foreground">Room:</span>
              <span className="font-mono font-bold tracking-widest text-primary text-sm">
                {online.roomCode}
              </span>
            </div>
          )}

          {isOnline && online.state === "playing" && (
            <VoiceChat
              roomCode={online.roomCode}
              playerId={online.playerId}
              isHost={online.playerColor === "w"}
              active={true}
            />
          )}

          {isBot && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">AI Level</span>
                <span className="text-xs font-bold text-primary">
                  {botLevel}
                </span>
              </div>
              <Slider
                min={1}
                max={15}
                step={1}
                value={[botLevel]}
                onValueChange={([v]) => setBotLevel(v)}
                data-ocid="bot.level.select"
              />
              {isThinking && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground thinking-pulse"
                  data-ocid="bot.thinking.loading_state"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  AI is thinking...
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {mode === "pvp" && (
              <Button
                variant="outline"
                size="sm"
                onClick={game.undoMove}
                disabled={game.history.length === 0}
                className="flex-1"
                data-ocid="game.undo.button"
              >
                <Undo2 className="w-3.5 h-3.5 mr-1" /> Undo
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={game.resetGame}
              className="flex-1"
              data-ocid="game.restart.button"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> New Game
            </Button>
          </div>

          <div className="flex-1 min-h-0">
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Move History
            </div>
            <ScrollArea className="h-40 lg:h-full rounded-md border border-border bg-secondary/20 p-2">
              {pairedMoves.length === 0 ? (
                <div
                  className="text-xs text-muted-foreground text-center py-4"
                  data-ocid="moves.empty_state"
                >
                  No moves yet
                </div>
              ) : (
                <div className="space-y-0.5">
                  {pairedMoves.map((pair) => (
                    <div
                      key={pair.n}
                      className="flex items-center gap-1 text-xs font-mono"
                      data-ocid={`moves.item.${pair.n}`}
                    >
                      <span className="text-muted-foreground w-5">
                        {pair.n}.
                      </span>
                      <span className="w-12 text-foreground">{pair.white}</span>
                      <span className="w-12 text-muted-foreground">
                        {pair.black ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
}
