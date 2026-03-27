import { Chess } from "chess.js";
import { useCallback, useRef, useState } from "react";

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw";

export type Move = {
  from: string;
  to: string;
  san: string;
  captured?: string;
};

function playSound(freq: number, duration: number) {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration / 1000,
    );
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (_) {}
}

export function useChessGame() {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [history, setHistory] = useState<Move[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");

  const updateStatus = useCallback((chess: Chess) => {
    if (chess.isCheckmate()) return setStatus("checkmate");
    if (chess.isStalemate()) return setStatus("stalemate");
    if (chess.isDraw()) return setStatus("draw");
    if (chess.isCheck()) return setStatus("check");
    setStatus("playing");
  }, []);

  const selectSquare = useCallback((square: string) => {
    const chess = chessRef.current;
    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalMoves(moves.map((m: any) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, []);

  const makeMove = useCallback(
    (from: string, to: string, promotion = "q"): string | null => {
      const chess = chessRef.current;
      try {
        const result = chess.move({
          from: from as any,
          to: to as any,
          promotion: promotion as any,
        });
        if (!result) return null;
        const captured = result.captured;
        if (captured) {
          playSound(330, 80);
        } else {
          playSound(440, 50);
        }
        setFen(chess.fen());
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);
        setHistory(
          chess.history({ verbose: true }).map((m: any) => ({
            from: m.from,
            to: m.to,
            san: m.san,
            captured: m.captured,
          })),
        );
        updateStatus(chess);
        if (chess.isCheck() && !chess.isCheckmate()) playSound(880, 100);
        return result.san;
      } catch (_) {
        return null;
      }
    },
    [updateStatus],
  );

  const undoMove = useCallback(() => {
    const chess = chessRef.current;
    chess.undo();
    setFen(chess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    const hist = chess.history({ verbose: true });
    setHistory(
      hist.map((m: any) => ({
        from: m.from,
        to: m.to,
        san: m.san,
        captured: m.captured,
      })),
    );
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
    updateStatus(chess);
  }, [updateStatus]);

  const resetGame = useCallback(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setHistory([]);
    setStatus("playing");
  }, []);

  const loadFen = useCallback(
    (newFen: string) => {
      const chess = chessRef.current;
      chess.load(newFen);
      setFen(chess.fen());
      setSelectedSquare(null);
      setLegalMoves([]);
      updateStatus(chess);
    },
    [updateStatus],
  );

  const turn = chessRef.current.turn();
  const isGameOver = chessRef.current.isGameOver();

  return {
    fen,
    turn,
    history,
    status,
    isGameOver,
    selectedSquare,
    legalMoves,
    lastMove,
    selectSquare,
    makeMove,
    undoMove,
    resetGame,
    loadFen,
    chess: chessRef.current,
  };
}
