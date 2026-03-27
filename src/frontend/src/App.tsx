import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ChessBoard } from "./components/ChessBoard";
import { GameScreen } from "./components/GameScreen";
import { type GameMode, ModeSelector } from "./components/ModeSelector";
import { OnlineSetup } from "./components/OnlineSetup";
import { AuthContext, useAuthState } from "./hooks/useAuth";
import { useOnlineRoom } from "./hooks/useOnlineRoom";

const queryClient = new QueryClient();

type Screen = "home" | "game" | "online-setup";

function AppInner() {
  const auth = useAuthState();
  const [screen, setScreen] = useState<Screen>("home");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [selecting, setSelecting] = useState(false);
  const online = useOnlineRoom();

  const handleModeSelect = (mode: GameMode) => {
    setSelecting(true);
    setTimeout(() => {
      setGameMode(mode);
      if (mode === "online") {
        setScreen("online-setup");
      } else {
        setScreen("game");
      }
      setSelecting(false);
    }, 500);
  };

  const handleBack = () => {
    setScreen("home");
    setGameMode(null);
    setSelecting(false);
    online.leaveRoom();
  };

  const handleOnlineReady = () => {
    setGameMode("online");
    setScreen("game");
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="app.loading_state"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {!auth.user ? (
        <AuthScreen />
      ) : screen === "game" && gameMode ? (
        <GameScreen mode={gameMode} onBack={handleBack} />
      ) : (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div
            className={`board-container relative w-full ${
              selecting ? "selecting" : "playing"
            }`}
            style={{ maxWidth: "min(70vh, 480px)" }}
          >
            {/* Background chess board */}
            <div className="opacity-40 pointer-events-none">
              <ChessBoard
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                selectedSquare={null}
                legalMoves={[]}
                lastMove={null}
                checkSquare={null}
                onSquareClick={() => {}}
                disabled
              />
            </div>

            {/* Overlay */}
            {screen === "home" && (
              <ModeSelector onSelect={handleModeSelect} visible={!selecting} />
            )}
            {screen === "online-setup" && (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                style={{
                  background: "rgba(12, 12, 18, 0.92)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <OnlineSetup
                  state={online.state}
                  roomCode={online.roomCode}
                  error={online.error}
                  onCreateRoom={online.createRoom}
                  onJoinRoom={(code) => {
                    online.joinRoom(code).then(() => {
                      if (online.state !== "idle") handleOnlineReady();
                    });
                  }}
                  onBack={handleBack}
                />
                {online.state === "playing" && (
                  <button
                    type="button"
                    className="mt-4 px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    onClick={handleOnlineReady}
                    data-ocid="online.start.button"
                  >
                    Start Game →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <Toaster />
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
