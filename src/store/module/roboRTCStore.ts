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

import adapter from 'webrtc-adapter'; // eslint-disable-line

import { ref } from "vue";
import { defineStore } from "pinia";
import store from "@/store";

import { type robotInfoData, RoomData } from "@/apis/types/service";
import { type SignalingServerConfiguration } from "@/apis/types/robortc";
import StreamClientStore from "./robortc/streamClientStore";
import DataChannelClinetStore from "./robortc/dcClientStore";
import Constants from "@/utils/constants";

export const useRoboRTCStore = defineStore("robortc", () => {
  const roboInfo = ref<robotInfoData>();
  const modules: Map<string, StreamClientStore | DataChannelClinetStore> =
    new Map();

  const initialize = (robo: robotInfoData) => {
    roboInfo.value = robo;
  };

  const start = async () => {
    if (!roboInfo.value) {
      throw new Error("robot info is null");
    }
    const rooms: Map<string, RoomData> | null = roboInfo.value.rooms;
    if (!rooms) {
      throw new Error("rooms is null");
    }
    const serverUrl = new URL(
      Constants.TELEOP_SERVER_URL +
        "/" +
        "service" +
        "/" +
        roboInfo.value.service
    ).toString();
    for (let [roomName, roomData] of rooms.entries()) {
      if (typeof roomData === "string") {
        roomData = JSON.parse(roomData) as RoomData;
        roomName = roomData.room_name;
      }
      const roomConfig: SignalingServerConfiguration = {
        url: serverUrl,
        name: roboInfo.value.control,
        token: roboInfo.value.token,
        iceServers: roboInfo.value.iceServers,
        room: roomName,
        roomId: roomData.room_id,
        role: roomData.role,
        type: roomData.room_type,
      };
      let client: StreamClientStore | DataChannelClinetStore;
      if (roomData.room_type === "video" || roomData.room_type === "audio") {
        client = new StreamClientStore(false);
      } else if (roomData.room_type === "local_rtc") {
        client = new StreamClientStore(true);
      } else if (
        roomData.room_type === "text" ||
        roomData.room_type === "binary"
      ) {
        client = new DataChannelClinetStore();
      } else {
        console.error(`room type ${roomData.room_type} is not supported`);
        continue;
      }
      await client.start(roomConfig);
      modules.set(roomName.toLocaleLowerCase(), client);
    }
  };

  return {
    initialize,
    start,
    modules,
  };
});

export function useRoboRTCStoreHook() {
  return useRoboRTCStore(store);
}
