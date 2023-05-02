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
  RTCRoom,
  RTCClient,
} from "@/apis/types/robortc";

import DataChannelClient from "./DataChannelClient";
import StreamClient from "./StreamClient";
import { getCookies, setCookies, getToken } from "@/utils/storage";
import Logger from "@/utils/logger";

export default abstract class SignalingClientStore {
  _logger = Logger.getInstance() as Logger;
  room: RTCRoom = {
    room_id: "",
    room_name: "",
    room_type: "",
    beforeunloadEventHandler: () => null,
    control: undefined as DataChannelClient | StreamClient | undefined,
    participants_list: [],
    participants: 0,
    inCallState: false,
  };
  signalingServerConfiguration = null as SignalingServerConfiguration | null;

  set signalingClient(payload: DataChannelClient | StreamClient) {
    this.room.control = payload;
  }

  get signalingClient(): DataChannelClient | StreamClient {
    return this.room.control;
  }

  updateClientsInRoom(payload: Array<RTCClient>) {
    this.room.participants_list = payload;
    this.room.participants = payload.length;
  }

  setBeforeunloadEventHandler(payload: Function) {
    this.room.beforeunloadEventHandler = payload as EventListener;
  }

  setInCallState(payload: boolean) {
    this.room.inCallState = payload;
  }

  incrementClientsInCall() {
    this.room.participants++;
  }

  decrementClientsInCall() {
    this.room.participants--;
  }

  setCallAcceptor(payload: () => boolean) {
    this.room.control.callAcceptor = payload;
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onSignalingConnectionOpen(): void {
    // TODO on signaling connection open
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onSignalingConnectionClose(): void {
    // TODO
    this.destroy();
  }

  protected onSignalingConnectionError(...message: string[]): void {
    this.destroy();
    alert(message);
  }

  protected create() {
    // add the beforeunload event listener
    window.addEventListener("beforeunload", this.room.beforeunloadEventHandler);
  }

  protected destroy() {
    // remove the beforeunload event listener
    window.removeEventListener(
      "beforeunload",
      this.room.beforeunloadEventHandler
    );
    this.room.beforeunloadEventHandler = () => null;
    this.room.participants_list = [];
    this.room.participants = 0;
    this.room.inCallState = false;
    this.room.control = null;
    this.room.room_id = "";
    this.room.room_name = "";
    this.room.room_type = "";
    this.signalingServerConfiguration = null;
  }

  protected onRoomClientsChange(clients: RTCClient[]) {
    if (!this.signalingClient) {
      return;
    }
    this.updateClientsInRoom(clients);
    if (clients.length >= 2 && !this.room.inCallState) {
      this.setInCallState(true);
      this.signalingClient.callAll();
    }
  }

  protected onClientConnect() {
    if (!this.signalingClient) {
      return;
    }
    this.incrementClientsInCall();
    this.setInCallState(true);
  }

  protected onClientDisconnect() {
    if (!this.signalingClient) {
      return;
    }
    this.decrementClientsInCall();
    this.setInCallState(false);
  }

  protected async configureHandler(
    config: SignalingServerConfiguration
  ): Promise<SignalingServerConfiguration> {
    if (
      window.sessionStorage.getItem(config.room ? config.room : "teleop") !==
      "busy"
    ) {
      window.sessionStorage.setItem(
        config.room ? config.room : "teleop",
        "busy"
      );
      const userToken = getToken() || "kubeedge";
      this.setBeforeunloadEventHandler(() => {
        setCookies(config.room + "-" + userToken, JSON.stringify(config), 5);
        setCookies(userToken, JSON.stringify(config), 5);
        window.sessionStorage.removeItem(config.room ? config.room : "teleop");
      });

      window.addEventListener(
        "beforeunload",
        this.room.beforeunloadEventHandler
      );
      let cookie = getCookies(config.room + "-" + userToken);

      if (cookie)
        // Check for empty string
        cookie = JSON.parse(cookie);

      if (cookie) {
        // Check for null
        config = cookie as SignalingServerConfiguration;
      } else {
        config = {
          url: config.url ? config.url : "ws://localhost:8080",
          iceServers: config.iceServers ? config.iceServers : [],
          token: config.token ? config.token : "",
          role: config.role ? config.role : "guest",
          name: config.name ? config.name : "Undefined",
          data: config.data ? config.data : {},
          room: config.room ? config.room : "teleop",
          type: config.type ? config.type : "",
        };
      }
    }
    return config;
  }

  protected async connectClientEvents() {
    if (!this.signalingClient) {
      return;
    }
    this.signalingClient.onSignalingConnectionOpen = async () => {
      this.onSignalingConnectionOpen();
    };
    this.signalingClient.onSignalingConnectionClose = async () => {
      this.onSignalingConnectionClose();
    };
    this.signalingClient.onSignalingConnectionError = async (
      ...message: string[]
    ) => {
      this.onSignalingConnectionError(...message);
    };
    this.signalingClient.onRoomClientsChange = async (clients: RTCClient[]) => {
      this.onRoomClientsChange(clients);
    };

    this.signalingClient.onClientConnect = async () => {
      this.onClientConnect();
    };
    this.signalingClient.onClientDisconnect = async () => {
      this.onClientDisconnect();
    };
  }

  connectClient() {
    if (!this.signalingClient) {
      return;
    }
    const client = this.signalingClient;
    return new Promise<void>((resolve) => {
      client.connect().then(() => resolve());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async initialize(config: SignalingServerConfiguration) {}

  async start(config: SignalingServerConfiguration) {
    await this.initialize(config);
    await this.connectClient();
  }
}
