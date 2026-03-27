import { useCallback, useEffect, useRef, useState } from "react";

export function useStockfish(level: number, enabled: boolean) {
  const workerRef = useRef<Worker | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const worker = new Worker(
      "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js",
    );
    workerRef.current = worker;
    worker.postMessage("uci");
    worker.onmessage = (e: MessageEvent) => {
      const line: string = e.data;
      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const move = parts[1] && parts[1] !== "(none)" ? parts[1] : null;
        setIsThinking(false);
        if (resolveRef.current) {
          resolveRef.current(move);
          resolveRef.current = null;
        }
      }
    };
    worker.postMessage(
      `setoption name Skill Level value ${Math.max(0, Math.min(20, level - 1))}`,
    );
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [enabled, level]);

  const getBestMove = useCallback(
    (fen: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const worker = workerRef.current;
        if (!worker) {
          resolve(null);
          return;
        }
        setIsThinking(true);
        resolveRef.current = resolve;
        const movetime = Math.max(200, level * 100);
        worker.postMessage(
          `setoption name Skill Level value ${Math.max(0, Math.min(20, level - 1))}`,
        );
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go movetime ${movetime}`);
      });
    },
    [level],
  );

  return { getBestMove, isThinking };
}
