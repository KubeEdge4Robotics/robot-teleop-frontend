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

import StreamClient from "./StreamClient";
import SignalingClientStore from "./signalingClientStore";
import {
  type StreamStatus,
  RTCClient,
  SignalingServerConfiguration,
  StreamConfiguration,
} from "@/apis/types/robortc";

export default class StreamClientStore extends SignalingClientStore {
  canSendStream: boolean;
  status: StreamStatus;
  isSendOnly: boolean;
  stream: MediaStream | undefined;

  constructor(canSendStream: boolean) {
    super();
    this.canSendStream = canSendStream;
    this.stream = undefined;
    this.isSendOnly = false;
    this.status = {
      micVolume: 1,
      volume: 1,
      isCameraOn: false,
    };
  }

  setSessionMicVolume(payload: number) {
    this.status.micVolume = payload;
  }

  setSessionVolume(payload: number) {
    this.status.volume = payload;
  }

  addClientInCall(id: string, stream: MediaStream) {
    const client = this.room.control._clients?.find(
      (c: RTCClient) => c.id === id
    );
    if (client) {
      client.isInCall = true;
      client.stream = stream;
    } else {
      this.room.control._clients?.push({
        id,
        name: "control",
        type: "stream",
        stream: stream,
        isInCall: true,
      } as RTCClient);
    }
    this.room.participants = this.room.control._clients?.length;
    this.room.participants_list = this.room.control._clients;
    if (!this.canSendStream && stream) this.stream = stream;
  }

  setLocalStream(payload: MediaStream) {
    const audioContext = new window.AudioContext();
    const micGain = audioContext.createGain();
    const destination = audioContext.createMediaStreamDestination();
    const controlledStream = destination.stream;
    let videoTracks = null,
      audioTracks = null;
    try {
      videoTracks = payload.getVideoTracks();
    } catch (error) {
      console.error("Error getting video tracks: ", error);
    }
    try {
      audioTracks = payload.getAudioTracks();
    } catch (error) {
      console.error("Error getting audio tracks: ", error);
    }
    const mic = audioContext.createMediaStreamSource(payload);
    mic.connect(micGain);
    micGain.connect(destination);
    if (videoTracks) {
      for (const videoTrack of videoTracks) {
        controlledStream.addTrack(videoTrack);
      }
    }
    if (audioTracks) {
      for (const audioTrack of audioTracks) {
        controlledStream.addTrack(audioTrack);
      }
    }
    this.stream = controlledStream;
  }

  toggleCamera() {
    if (this.stream) {
      const videoTracks = this.stream.getVideoTracks();
      for (const videoTrack of videoTracks) {
        videoTrack.enabled = !videoTrack.enabled;
      }
      this.status.isCameraOn = !this.status.isCameraOn;
    }
  }

  updateStatus(payload: StreamStatus) {
    if (this.status.isCameraOn !== payload.isCameraOn) {
      this.toggleCamera();
    }
    this.status = payload;
  }

  fetchLocalStream(constraint?: MediaStreamConstraints) {
    return new Promise<MediaStream | undefined>((resolve) => {
      if (!constraint) constraint = { video: true, audio: true };
      try {
        navigator.mediaDevices
          .getUserMedia(constraint)
          .then((stream: MediaStream): void => resolve(stream))
          .catch((): void => {
            alert("Can't access default media (Camera nor mic)");
            resolve(undefined);
          });
      } catch (err) {
        console.error("Can't access default media (Camera nor mic)");
      }
    });
  }

  initStreamConfiguration(): StreamConfiguration {
    return { stream: this.stream, isSendOnly: this.isSendOnly };
  }

  protected async initialize(
    signalingServerConfiguration: SignalingServerConfiguration
  ) {
    await super.initialize(signalingServerConfiguration);
    if (this.canSendStream) {
      const constraint = { video: true, audio: true };
      const local_stream = await this.fetchLocalStream(constraint);
      if (local_stream) this.setLocalStream(local_stream);
    }
    const streamConfiguration = this.initStreamConfiguration();
    this.signalingClient = new StreamClient(
      signalingServerConfiguration,
      streamConfiguration
    );
    await this.connectClientEvents();
  }

  protected async connectClientEvents() {
    if (!(this.signalingClient instanceof StreamClient)) {
      console.error("Signaling client is not a StreamClient");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    await super.connectClientEvents();
    this.signalingClient.onAddRemoteStream = (id, stream) => {
      self.addClientInCall(id, stream);
    };
  }
}
