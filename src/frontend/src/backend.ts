/* eslint-disable */
// @ts-nocheck
import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE, type RoomInfo, type Signal } from "./declarations/backend.did";
export type { RoomInfo, Signal };
export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;

function some<T>(value: T): Some<T> { return { __kind__: "Some", value }; }
function none(): None { return { __kind__: "None" }; }
function isNone<T>(option: Option<T>): option is None { return option.__kind__ === "None"; }
function isSome<T>(option: Option<T>): option is Some<T> { return option.__kind__ === "Some"; }
function unwrap<T>(option: Option<T>): T {
  if (isNone(option)) throw new Error("unwrap: none");
  return option.value;
}

export class ExternalBlob {
  _blob?: Uint8Array<ArrayBuffer> | null;
  directURL: string;
  onProgress?: (percentage: number) => void = undefined;
  private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
    if (blob) this._blob = blob;
    this.directURL = directURL;
  }
  static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
    return new ExternalBlob(url, blob);
  }
  public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._blob) return this._blob;
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  public getDirectURL(): string { return this.directURL; }
  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export interface backendInterface {
  createRoom(hostId: string): Promise<string>;
  joinRoom(code: string, guestId: string): Promise<boolean>;
  pushMove(code: string, fen: string, san: string): Promise<boolean>;
  getRoom(code: string): Promise<[] | [RoomInfo]>;
  postSignal(code: string, from: string, signalType: string, data: string): Promise<boolean>;
  setFinished(code: string): Promise<boolean>;
}

export class Backend implements backendInterface {
  constructor(
    private actor: ActorSubclass<_SERVICE>,
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    private processError?: (error: unknown) => never
  ) {}

  async createRoom(hostId: string): Promise<string> {
    try { return await this.actor.createRoom(hostId); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  async joinRoom(code: string, guestId: string): Promise<boolean> {
    try { return await this.actor.joinRoom(code, guestId); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  async pushMove(code: string, fen: string, san: string): Promise<boolean> {
    try { return await this.actor.pushMove(code, fen, san); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  async getRoom(code: string): Promise<[] | [RoomInfo]> {
    try { return await this.actor.getRoom(code); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  async postSignal(code: string, from: string, signalType: string, data: string): Promise<boolean> {
    try { return await this.actor.postSignal(code, from, signalType, data); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
  async setFinished(code: string): Promise<boolean> {
    try { return await this.actor.setFinished(code); }
    catch (e) { if (this.processError) this.processError(e); throw e; }
  }
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

export function createActor(
  canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {}
): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
  }
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
