import React from "react";
import { ChessPiece } from "./ChessPieceSVG";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type Props = {
  fen: string;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  flipped?: boolean;
  onSquareClick: (sq: string) => void;
  disabled?: boolean;
};

function parseFen(fen: string): Record<string, string> {
  const pieces: Record<string, string> = {};
  const board = fen.split(" ")[0];
  const rows = board.split("/");
  rows.forEach((row, rankIdx) => {
    const rank = 8 - rankIdx;
    let fileIdx = 0;
    for (const ch of row) {
      if (/[1-8]/.test(ch)) {
        fileIdx += Number.parseInt(ch);
      } else {
        const file = FILES[fileIdx];
        const color = ch === ch.toUpperCase() ? "w" : "b";
        const piece = ch.toUpperCase();
        pieces[`${file}${rank}`] = `${color}${piece}`;
        fileIdx++;
      }
    }
  });
  return pieces;
}

export function ChessBoard({
  fen,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  flipped = false,
  onSquareClick,
  disabled = false,
}: Props) {
  const pieces = parseFen(fen);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <div
      className="relative select-none shadow-board"
      style={{ aspectRatio: "1/1", width: "100%" }}
    >
      {ranks.map((rank) =>
        files.map((file) => {
          const sq = `${file}${rank}`;
          const isLight = (FILES.indexOf(file) + rank) % 2 === 0;
          const piece = pieces[sq];
          const isSelected = selectedSquare === sq;
          const isPossible = legalMoves.includes(sq);
          const isLastFrom = lastMove?.from === sq;
          const isLastTo = lastMove?.to === sq;
          const isCheck = checkSquare === sq;
          const hasPiece = !!piece;

          // Determine square background
          let bgColor = isLight ? "#F0D9B5" : "#B58863";
          if (isLastFrom) bgColor = isLight ? "#CDD26A" : "#AABA3A";
          if (isLastTo) bgColor = isLight ? "#CDD26A" : "#AABA3A";
          if (isCheck) bgColor = "#e74c3c";

          return (
            <button
              type="button"
              key={sq}
              aria-label={`Square ${sq}${piece ? ` with ${piece}` : ""}`}
              disabled={disabled}
              className={`absolute p-0 border-0 outline-none focus:outline-none ${
                disabled ? "cursor-default" : "cursor-pointer"
              }`}
              style={{
                width: "12.5%",
                height: "12.5%",
                left: `${files.indexOf(file) * 12.5}%`,
                top: `${(flipped ? ranks.indexOf(rank) : RANKS.indexOf(rank)) * 12.5}%`,
                position: "absolute",
                backgroundColor: bgColor,
              }}
              onClick={() => onSquareClick(sq)}
            >
              {/* Selected highlight */}
              {isSelected && (
                <span
                  className="absolute inset-0 z-10"
                  style={{ backgroundColor: "rgba(20, 85, 30, 0.5)" }}
                />
              )}

              {/* Legal move dot (empty square) */}
              {isPossible && !hasPiece && (
                <span
                  className="absolute z-20 rounded-full"
                  style={{
                    width: "33%",
                    height: "33%",
                    top: "33.5%",
                    left: "33.5%",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                  }}
                />
              )}

              {/* Legal move ring (capture) */}
              {isPossible && hasPiece && (
                <span
                  className="absolute inset-0 z-20"
                  style={{
                    borderRadius: "50%",
                    boxShadow: "inset 0 0 0 4px rgba(0,0,0,0.3)",
                  }}
                />
              )}

              {/* Piece */}
              {piece && (
                <span
                  className="absolute inset-0 flex items-center justify-center z-30 piece-hover"
                  style={{ padding: "5%" }}
                >
                  <ChessPiece piece={piece} size={99} />
                </span>
              )}

              {/* Rank label */}
              {file === (flipped ? "h" : "a") && (
                <span
                  className="absolute top-0.5 left-0.5 font-mono font-bold z-40 pointer-events-none"
                  style={{
                    fontSize: "0.6rem",
                    lineHeight: 1,
                    color: isLight ? "#B58863" : "#F0D9B5",
                  }}
                >
                  {rank}
                </span>
              )}

              {/* File label */}
              {rank === (flipped ? 8 : 1) && (
                <span
                  className="absolute bottom-0.5 right-0.5 font-mono font-bold z-40 pointer-events-none"
                  style={{
                    fontSize: "0.6rem",
                    lineHeight: 1,
                    color: isLight ? "#B58863" : "#F0D9B5",
                  }}
                >
                  {file}
                </span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
