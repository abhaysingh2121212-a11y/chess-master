/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

const Signal = IDL.Record({
  from: IDL.Text,
  signalType: IDL.Text,
  data: IDL.Text,
  timestamp: IDL.Int,
});

const RoomInfo = IDL.Record({
  code: IDL.Text,
  hostId: IDL.Text,
  guestId: IDL.Opt(IDL.Text),
  moves: IDL.Vec(IDL.Text),
  moveList: IDL.Vec(IDL.Text),
  status: IDL.Text,
  signals: IDL.Vec(Signal),
});

export const idlService = IDL.Service({
  createRoom: IDL.Func([IDL.Text], [IDL.Text], []),
  joinRoom: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  pushMove: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  getRoom: IDL.Func([IDL.Text], [IDL.Opt(RoomInfo)], ['query']),
  postSignal: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  setFinished: IDL.Func([IDL.Text], [IDL.Bool], []),
});

export const idlInitArgs = [];
export const idlFactory = ({ IDL }) => {
  const Signal = IDL.Record({
    from: IDL.Text,
    signalType: IDL.Text,
    data: IDL.Text,
    timestamp: IDL.Int,
  });
  const RoomInfo = IDL.Record({
    code: IDL.Text,
    hostId: IDL.Text,
    guestId: IDL.Opt(IDL.Text),
    moves: IDL.Vec(IDL.Text),
    moveList: IDL.Vec(IDL.Text),
    status: IDL.Text,
    signals: IDL.Vec(Signal),
  });
  return IDL.Service({
    createRoom: IDL.Func([IDL.Text], [IDL.Text], []),
    joinRoom: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    pushMove: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    getRoom: IDL.Func([IDL.Text], [IDL.Opt(RoomInfo)], ['query']),
    postSignal: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    setFinished: IDL.Func([IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
