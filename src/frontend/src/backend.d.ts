import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
  __kind__: "Some";
  value: T;
}
export interface None {
  __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface Signal {
  from: string;
  signalType: string;
  data: string;
  timestamp: bigint;
}
export interface RoomInfo {
  code: string;
  hostId: string;
  guestId: [] | [string];
  moves: string[];
  moveList: string[];
  status: string;
  signals: Signal[];
}
export interface backendInterface {
  createRoom(hostId: string): Promise<string>;
  joinRoom(code: string, guestId: string): Promise<boolean>;
  pushMove(code: string, fen: string, san: string): Promise<boolean>;
  getRoom(code: string): Promise<[] | [RoomInfo]>;
  postSignal(code: string, from: string, signalType: string, data: string): Promise<boolean>;
  setFinished(code: string): Promise<boolean>;
}
