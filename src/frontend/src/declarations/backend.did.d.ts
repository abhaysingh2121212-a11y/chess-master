/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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
export interface _SERVICE {
  createRoom: ActorMethod<[string], string>;
  joinRoom: ActorMethod<[string, string], boolean>;
  pushMove: ActorMethod<[string, string, string], boolean>;
  getRoom: ActorMethod<[string], [] | [RoomInfo]>;
  postSignal: ActorMethod<[string, string, string, string], boolean>;
  setFinished: ActorMethod<[string], boolean>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
