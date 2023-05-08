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

import DataChannelClient from "./DataChannelClient";
import SignalingClientStore from "./signalingClientStore";
import {
  type RoboStatus,
  RoboMessage,
  RTCClient,
  SignalingServerConfiguration,
  DataChannelConfiguration,
} from "@/apis/types/robortc";

export default class DataChannelClinetStore extends SignalingClientStore {
  dataChannel = null as RTCDataChannel | null;
  _dataChannelConfiguration = null as RTCDataChannelInit | null;
  status = null as RoboStatus | null;
  message = null as RoboMessage | null;
  msg_count = 0;

  setDataChannel(id: string, payload: RTCDataChannel) {
    this.dataChannel = payload;
    const client = this.room.control._clients?.find(
      (c: RTCClient) => c.id === id
    );
    if (client) {
      client.dataChannel = this.dataChannel;
      client.isInCall = true;
    } else {
      this.room.control._clients?.push({
        id,
        name: "control",
        type: "datachannel",
        isInCall: true,
        dataChannel: this.dataChannel,
      } as RTCClient);
    }

    this.room.participants = this.room.control._clients?.length;
    this.room.participants_list = this.room.control._clients;
  }

  set dataChannelConfiguration(payload: RTCDataChannelInit) {
    this._dataChannelConfiguration = payload;
  }

  changeRobotStatus(payload: RoboStatus) {
    if (!this.status) {
      this.status = payload;
    } else {
      this.status.battery = payload.battery;
      this.status.cpuUsage = payload.cpuUsage;
      this.status.memUsage = payload.memUsage;
      this.status.diskUsage = payload.diskUsage;
      this.status.wifiNetwork = payload.wifiNetwork;
      this.status.wifiStrength = payload.wifiStrength;
      this.status.localIp = payload.localIp;
    }
    const elem = document.getElementById(
      "robotMicVolumeSlider"
    ) as HTMLInputElement;
    if (
      this.status.micVolume != payload.micVolume &&
      payload.micVolume &&
      elem
    ) {
      elem.value = payload.micVolume.toString();
    }
  }

  increRobotMessage(payload: RoboMessage) {
    this.msg_count += 1;
    this.message = payload;
  }

  setRobotMicVolume(payload: number) {
    if (this.status) this.status.micVolume = payload;
  }

  toggleRobotCamera() {
    if (this.status) this.status.isCameraOn = !this.status.isCameraOn;
  }

  initDataChannelConfiguration() {
    this.dataChannelConfiguration = {};
  }

  send(data: string | object) {
    if (this.signalingClient instanceof DataChannelClient) {
      const msg = typeof data === "string" ? data : JSON.stringify(data);
      this.signalingClient.sendToAll(msg);
    }
  }

  startTeleop() {
    this.send({ type: "start_teleop" });
    if (this.status) {
      this.status.isTeleopOn = true;
    } else {
      this.status = {
        isTeleopOn: true,
        isCameraOn: false,
        micVolume: 0,
        battery: 0,
        cpuUsage: 0,
        memUsage: 0,
        diskUsage: 0,
        wifiNetwork: "",
        wifiStrength: 0,
        localIp: "",
        data: {},
      } as RoboStatus;
    }
  }

  stopTeleop() {
    this.send({ type: "stop_teleop" });
    if (this.status) this.status.isTeleopOn = false;
  }

  protected async initialize(config: SignalingServerConfiguration) {
    this.initDataChannelConfiguration();
    await super.initialize(config);
    this.signalingClient = new DataChannelClient(
      config as SignalingServerConfiguration,
      this._dataChannelConfiguration as DataChannelConfiguration
    );

    await this.connectClientEvents();
  }

  protected async connectClientEvents() {
    if (!(this.signalingClient instanceof DataChannelClient)) {
      return;
    }
    await super.connectClientEvents();
    this.signalingClient.onDataChannelOpen = (id: string) => {
      // send init message
      this.startTeleop();
      this._logger.info("DataChannel open", this.status);
    };
    this.signalingClient.onDataChannelClose = (id: string) => {
      this._logger.debug("DataChannel close", id);
      // send close message
      this.stopTeleop();
    };
    this.signalingClient.onDataChannelMessage = (id: string, data: string) => {
      this._logger.debug("DataChannel message", data);
      const parsedMsg = JSON.parse(data);
      if (parsedMsg.type === "robotStatus" && parsedMsg.status) {
        this.changeRobotStatus(parsedMsg.status);
      } else if (parsedMsg.type === "robotMessage" && parsedMsg.message) {
        this.increRobotMessage(parsedMsg.message);
      }
    };
    this.signalingClient.onAddDataChannel = (
      id: string,
      channel: RTCDataChannel
    ) => {
      this.setDataChannel(id, channel);
    };
  }
}
