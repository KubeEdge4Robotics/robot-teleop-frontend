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

import {
  type SignalingServerConfiguration,
  StreamConfiguration,
} from "@/apis/types/robortc";
import SignalingClient from "./SignalingClient";

export default class StreamClient extends SignalingClient {
  _streamConfiguration: StreamConfiguration;
  _remoteStreams: Record<string, MediaStream>;
  _offerOptions: RTCOfferOptions;
  _isLocalAudioMuted: boolean;
  _isRemoteAudioMuted: boolean;
  _isLocalVideoMuted: boolean;

  constructor(
    signalingServerConfiguration: SignalingServerConfiguration,
    streamConfiguration: StreamConfiguration
  ) {
    super(signalingServerConfiguration);

    if (!window.RTCPeerConnection) {
      throw new Error("RTCPeerConnection is not supported.");
    }

    this._streamConfiguration = streamConfiguration;
    this._remoteStreams = {};

    this._onAddRemoteStream = () => {};

    this._offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };

    this._isLocalAudioMuted = false;
    this._isRemoteAudioMuted = true;
    this._isLocalVideoMuted = false;
  }

  _onAddRemoteStream(id: string, stream: MediaStream) {
    console.log("Add remote stream: " + id + ", " + stream.id);
  }

  _createRtcPeerConnection() {
    const rtcPeerConnection = new window.RTCPeerConnection(
      this._rtcConfiguration
    );
    const localStream = this._streamConfiguration.stream;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind == "audio") {
          track.enabled = !this._isLocalAudioMuted;
        } else if (track.kind == "video") {
          track.enabled = !this._isLocalVideoMuted;
        }
        rtcPeerConnection.addTrack(track, localStream);
      });
    }

    return rtcPeerConnection;
  }

  _connectRtcPeerConnectionEvents(
    id: string,
    rtcPeerConnection: RTCPeerConnection
  ) {
    super._connectRtcPeerConnectionEvents(id, rtcPeerConnection);

    if (!this._streamConfiguration.isSendOnly) {
      rtcPeerConnection.ontrack = (event) => {
        this._logger.info("RtcPeerConnection ontrack event, event=", event);

        if (!(id in this._remoteStreams)) {
          this._logger.info("Create remote stream for id: " + id);
          this._remoteStreams[id] = new window.MediaStream();
          this._remoteStreams[id].addTrack(event.track);
          this._onAddRemoteStream(id, this._remoteStreams[id]);
          this.updateRoomClients();
        } else {
          this._logger.info("Add track to remote stream for id: " + id);
          this._remoteStreams[id].addTrack(event.track);
          console.log(">>>>>>", this._remoteStreams[id]);
        }
      };
    }
  }

  _disconnectRtcPeerConnectionEvents(rtcPeerConnection: RTCPeerConnection) {
    super._disconnectRtcPeerConnectionEvents(rtcPeerConnection);

    rtcPeerConnection.ontrack = () => {};
  }

  _removeConnection(id: string) {
    super._removeConnection(id);

    if (id in this._remoteStreams) {
      this._remoteStreams[id].getTracks().forEach((track) => track.stop());
      delete this._remoteStreams[id];
    }
  }

  _closeAllRemoteStreams() {
    for (const id in this._remoteStreams) {
      this._remoteStreams[id].getTracks().forEach((track) => track.stop());
    }
    this._remoteStreams = {};
  }

  /**
   * @brief Hangs up all clients.
   */
  hangUpAll() {
    super.hangUpAll();
    this._closeAllRemoteStreams();
  }

  /**
   * @brief Closes all client connections
   */
  close() {
    this._closeAllRemoteStreams();
    super.close();
  }

  /**
   * @brief Indicates if the local audio is muted.
   * @return {Boolean} true if the local audio is muted.
   */
  get isLocalAudioMuted() {
    return this._isLocalAudioMuted;
  }

  /**
   * @brief Indicates if the remote audio is muted.
   * @return {Boolean} true if the remote audio is muted.
   */
  get isRemoteAudioMuted() {
    return this._isRemoteAudioMuted;
  }

  /**
   * @brief Indicates if the local video is muted.
   * @return {Boolean} true if the local audio is muted.
   */
  get isLocalVideoMuted() {
    return this._isLocalVideoMuted;
  }

  /**
   * @brief Mutes the local audio.
   */
  muteLocalAudio() {
    this.setLocalAudioMuted(true);
  }

  /**
   * @brief Unmutes the local audio.
   */
  unmuteLocalAudio() {
    this.setLocalAudioMuted(false);
  }

  /**
   * @brief Mutes or unmutes the local audio.
   * @param muted indicates if the local audio is muted or not (true or false)
   */
  setLocalAudioMuted(muted: boolean) {
    this._isLocalAudioMuted = muted;
    this._setAllLocalTracksEnabled("audio", !muted);
  }

  /**
   * @brief Mutes the remote audio.
   */
  muteRemoteAudio() {
    this.setRemoteAudioMuted(true);
  }

  /**
   * @brief Unmutes the remote audio.
   */
  unmuteRemoteAudio() {
    this.setRemoteAudioMuted(false);
  }

  /**
   * @brief Mutes or unmutes the remote audio.
   * @param {Boolean} muted indicates if the remote audio is muted or not
   */
  setRemoteAudioMuted(muted: boolean) {
    this._isRemoteAudioMuted = muted;
    this._setAllRemoteTracksEnabled("audio", !muted);
  }

  /**
   * @brief Mutes the local video.
   */
  muteLocalVideo() {
    this.setLocalVideoMuted(true);
  }

  /**
   * @brief Unmutes the local video.
   */
  unmuteLocalVideo() {
    this.setLocalVideoMuted(false);
  }

  /**
   * @brief Mutes or unmutes the local video.
   * @param {Boolean} muted indicates if the local video is muted or not
   */
  setLocalVideoMuted(muted: boolean) {
    this._isLocalVideoMuted = muted;
    this._setAllLocalTracksEnabled("video", !muted);
  }

  _setAllLocalTracksEnabled(kind: string, enabled: boolean) {
    console.error("setAllLocalTracksEnabled", kind, enabled);
    this._getAllRtcPeerConnection().forEach((rtcPeerConnection) => {
      const senders = rtcPeerConnection.getSenders();
      senders.forEach((sender) => {
        if (sender.track?.kind == kind) {
          sender.track.enabled = enabled;
        }
      });
    });
  }

  _setAllRemoteTracksEnabled(kind: string, enabled: boolean) {
    console.error("setAllLocalTracksEnabled", kind, enabled);

    this._getAllRtcPeerConnection().forEach((rtcPeerConnection) => {
      const receivers = rtcPeerConnection.getReceivers();
      receivers.forEach((receiver) => {
        if (receiver.track.kind == kind) {
          receiver.track.enabled = enabled;
        }
      });
    });
  }

  set onAddRemoteStream(
    onAddRemoteStream: (id: string, stream: MediaStream) => void
  ) {
    this._onAddRemoteStream = onAddRemoteStream;
  }
}
