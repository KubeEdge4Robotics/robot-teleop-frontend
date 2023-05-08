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
  DataChannelConfiguration,
} from "@/apis/types/robortc";
import SignalingClient from "./SignalingClient";

export default class DataChannelClient extends SignalingClient {
  _dataChannels: Record<string, RTCDataChannel>;
  _dataChannelConfiguration: DataChannelConfiguration;

  constructor(
    signalingServerConfiguration: SignalingServerConfiguration,
    dataChannelConfiguration: DataChannelConfiguration
  ) {
    super(signalingServerConfiguration);
    this._dataChannelConfiguration = dataChannelConfiguration;
    this._dataChannels = {};
    this._onAddDataChannel = () => {};
  }

  _onAddDataChannel(id: string, channel: RTCDataChannel) {
    this._logger.debug("Add data channel: " + id + ", " + channel.id);
  }

  _onDataChannelMessage(id: string, data: any) {
    this._logger.debug("Data channel message: " + id + ", " + data);
  }

  _onDataChannelOpen(id: string) {
    this._logger.debug("Data channel open: " + id);
  }

  _onDataChannelClose(id: string) {
    this._logger.debug("Data channel close: " + id);
  }

  _onDataChannelError(id: string, event: Event) {
    console.error("Data channel error: " + id + ", " + event);
  }

  _createRtcPeerConnection(id: string, isCaller: boolean) {
    const rtcPeerConnection = new window.RTCPeerConnection(
      this._rtcConfiguration
    );
    if (isCaller) {
      const dataChannel = rtcPeerConnection.createDataChannel(
        this._signalingServerConfiguration.room,
        this._dataChannelConfiguration
      );
      this._dataChannels[id] = dataChannel;
      this._connectDataChannelEvents(id, dataChannel);
    }
    return rtcPeerConnection;
  }

  _connectRtcPeerConnectionEvents(
    id: string,
    rtcPeerConnection: RTCPeerConnection
  ) {
    super._connectRtcPeerConnectionEvents(id, rtcPeerConnection);
    // if (!(id in this._dataChannels)) {
    rtcPeerConnection.ondatachannel = ({ channel: dataChannel }) => {
      this._dataChannels[id] = dataChannel;
      this._onAddDataChannel(id, this._dataChannels[id]);
      this._connectDataChannelEvents(id, dataChannel);
    };
    // }
  }

  _disconnectRtcPeerConnectionEvents(rtcPeerConnection: RTCPeerConnection) {
    super._disconnectRtcPeerConnectionEvents(rtcPeerConnection);

    rtcPeerConnection.ondatachannel = () => {};
  }

  _connectDataChannelEvents(id: string, dataChannel: RTCDataChannel) {
    dataChannel.onmessage = (event) => {
      this._onDataChannelMessage(id, event.data);
    };
    dataChannel.onopen = () => {
      this._logger.info("onDataChannelOpen, id=", id);

      this._onDataChannelOpen(id);
      this.updateRoomClients();
    };
    dataChannel.onclose = () => {
      this._logger.info("onDataChannelClose, id=", id);

      this._removeConnection(id);
      this.updateRoomClients();
    };
    dataChannel.onerror = (event) => {
      this._logger.info("onDataChannelError, id=", id);

      this._removeConnection(id);
      this._onDataChannelError(id, event);
      this.updateRoomClients();
    };
  }

  _disconnectDataChannelEvents(dataChannel: RTCDataChannel) {
    dataChannel.onmessage = () => {};
    dataChannel.onopen = () => {};
    dataChannel.onclose = () => {};
    dataChannel.onerror = () => {};
  }

  _closeAllDataChannels() {
    for (const id in this._dataChannels) {
      this._dataChannels[id].close();
      this._disconnectDataChannelEvents(this._dataChannels[id]);
      delete this._dataChannels[id];
      this._onDataChannelClose(id);
    }
  }

  hangUpAll() {
    super.hangUpAll();
    this._closeAllDataChannels();
  }

  close() {
    this._closeAllDataChannels();
    super.close();
  }

  sendTo(data: any, ids: string[]) {
    ids.forEach((id) => this._dataChannels[id].send(data));
  }

  sendToAll(data: any) {
    for (const id in this._dataChannels) {
      if (this._dataChannels[id].readyState === "open") {
        this._dataChannels[id].send(data);
      }
    }
  }

  set onDataChannelMessage(
    onDataChannelMessage: (id: string, data: any) => void
  ) {
    this._onDataChannelMessage = onDataChannelMessage;
  }

  set onDataChannelOpen(onDataChannelOpen: (id: string) => void) {
    this._onDataChannelOpen = onDataChannelOpen;
  }

  set onDataChannelClose(onDataChannelClose: (id: string) => void) {
    this._onDataChannelClose = onDataChannelClose;
  }

  set onDataChannelError(
    onDataChannelError: (id: string, event: Event) => void
  ) {
    this._onDataChannelError = onDataChannelError;
  }

  set onAddDataChannel(
    onAddDataChannel: (id: string, channel: RTCDataChannel) => void
  ) {
    this._onAddDataChannel = onAddDataChannel;
  }
}
