/*
 * Copyright 2021 The KubeEdge Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface SignalingServerConfiguration {
  url: string;
  token: string;
  name?: string;
  iceServers?: RTCIceServer[];
  data?: Record<string, string>;
  roomId?: string;
  room: string;
  type?: string;
  role?: string;
}

export interface StreamConfiguration {
  isSendOnly: boolean;
  stream?: MediaStream;
}

export interface DataChannelConfiguration {
  label?: string;
  ordered?: boolean;
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
}

export interface RTCClient {
  id: string;
  name: string;
  type?: string;
  channel?: RTCDataChannel;
  stream?: MediaStream;
  isInCall?: boolean;
  isConnected?: boolean;
}

export interface RTCRoom {
  room_id: string;
  room_name: string;
  room_type?: string;
  inCallState?: boolean;
  service_id?: string;
  max_users?: number;
  control?: any; // signalingClient
  participants: number;
  participants_list?: RTCClient[];
  beforeunloadEventHandler: EventListener;
}

export interface PeerCallReceivedData {
  fromId: string;
  offer: RTCSessionDescriptionInit;
}

export interface PeerAnswerReceivedData {
  fromId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateReceivedData {
  fromId: string;
  candidate: RTCIceCandidateInit;
}

export interface RoboStatus {
  battery?: number;
  cpuUsage?: number;
  memUsage?: number;
  diskUsage?: number;
  wifiNetwork?: string;
  wifiStrength?: number;
  localIp?: string;
  micVolume?: number;
  isCameraOn?: boolean;
  isTeleopOn?: boolean;
  data?: Record<string, string>;
}

export interface RoboMessage {
  type: string;
  data: string;
}

export interface StreamStatus {
  isCameraOn: boolean;
  micVolume?: number;
  volume?: number;
}
