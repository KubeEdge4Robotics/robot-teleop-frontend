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

import { ref } from "vue";
import { defineStore } from "pinia";
import store from "@/store";
import {
  createServiceApi,
  getServiceApi,
  startTeleopApi,
  stopTeleopApi,
} from "@/apis/service";
import {
  type RobotData,
  ServicesData,
  allRobotInfoData,
  robotInfoData,
  RoomData,
  cameraData,
} from "@/apis/types/service";
import Logger from "@/utils/logger";

export const useRobotStore = defineStore("robot", () => {
  const robotInfo = ref<allRobotInfoData>();
  const logger = Logger.getInstance();

  const _initial_robot = (robot: RobotData, service: ServicesData) => {
    const camera_num = robot.camera?.length || 0;
    let status = robot.status?.toLowerCase();
    if (service.status !== "active") {
      status = "stopped";
    }
    const rooms = service.rooms?.rooms;
    if (!rooms) {
      logger.error("robot store: rooms is null");
      return;
    }

    const test_cameras = [
      {
        camera_id: "test_camera_1",
        camera_name: "bottom_camera",
        camera_type: "video",
        camera_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        camera_id: "test_camera_2",
        camera_name: "top_camera",
        camera_type: "video",
        camera_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ];
    robot.camera = test_cameras as cameraData[];
    robot.camera_num = 2;

    // transform robot.camera to Map
    const allCamera = new Map<string, string>();
    for (const cam of robot.camera || []) {
      if (!cam.camera_name) continue;
      allCamera.set(cam.camera_name, cam.camera_id);
    }
    const filter_rooms = new Map<string, RoomData>();
    for (let [room_name, room_data] of Object.entries(rooms)) {
      if (!room_data) continue;
      if (typeof room_data === "string") {
        room_data = JSON.parse(room_data) as RoomData;
        room_name = room_data.room_name;
      }
      let valid = true;
      if (room_data.room_type === "audio" && !robot.audio_support) {
        valid = false;
      } else if (room_data.room_name === "point_cloud" && !robot.pcl_support) {
        valid = false;
      } else if (room_data.room_type === "video") {
        if (!allCamera.has(room_data.room_name)) valid = false;
      }
      if (valid) filter_rooms.set(room_name, room_data);
    }
    const ice_server: RTCIceServer[] = [service.ice_server as RTCIceServer];
    const robo = {
      id: robot.robot_id,
      type: robot.robot_type as string,
      name: robot.robot_name as string,
      service: robot.service_id as string,
      rooms: filter_rooms,
      status: status,
      iceServers: ice_server,
      token: service.token,
      camera: robot.camera,
      camera_num: camera_num,
      skills: robot.skills,
      pcl_support: robot.pcl_support as boolean,
      audio_support: robot.audio_support as boolean,
      control: robot.control as string | null,
    } as robotInfoData;
    if (!robotInfo.value) {
      robotInfo.value = {
        robots: new Map<string, robotInfoData>(),
        count: 0,
      };
    }
    robotInfo.value.robots.set(robot.robot_id, robo);
    robotInfo.value.count += 1;
    return robo;
  };

  const _initial_service = (robot: RobotData) => {
    return new Promise((resolve) => {
      const service = ref<ServicesData | null>();
      let service_id = robot.service_id || "";

      if (service_id) {
        getServiceApi(service_id).then((res: ServicesData) => {
          service.value = res;
          if (service.value?.status === "active") {
            if (
              service.value.user_id &&
              service.value.user_id !== robot.robot_id
            ) {
              logger.error("robot is not the owner of the service");
              service.value = null;
            } else {
              resolve(service.value);
            }
          } else if (service.value?.status === "deleted") {
            logger.error("service is invalid");
            service.value = null;
          }
          if (!service.value) {
            createServiceApi().then((res: ServicesData) => {
              service_id = res.service_id;
              service.value = res;
              resolve(service.value);
            });
          }
        });
      } else {
        createServiceApi().then((res: ServicesData) => {
          service_id = res.service_id;
          service.value = res;
          resolve(service.value);
        });
      }
    });
  };

  const startRobot = (robot: RobotData, userName: string) => {
    return new Promise((resolve) => {
      const service = ref<ServicesData | null>();
      const robo = ref<robotInfoData>();
      _initial_service(robot).then((res) => {
        if (!res) {
          logger.error("service is invalid");
          resolve(false);
        } else {
          service.value = res as ServicesData;
          const service_id = service.value.service_id || "";
          if (robot.control === userName) {
            logger.warn("robot is already started");
            robo.value = _initial_robot(robot, service.value);
            if (typeof robo.value === "undefined") {
              resolve(false);
            } else {
              resolve(true);
            }
          }
          startTeleopApi(robot.robot_id, service_id, userName).then(
            (res: ServicesData) => {
              service.value = res;
              robot.service_id = service.value.service_id;
              robot.control = service.value.user_id || userName;
              robo.value = _initial_robot(robot, service.value);
              if (typeof robo.value === "undefined") {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
        }
      });
    });
  };

  const getRobot = (robotId: string) => {
    return new Promise((resolve) => {
      if (robotInfo.value) {
        resolve(robotInfo.value.robots.get(robotId));
      }
      resolve(null);
    });
  };

  const stopRobot = (robotId: string) => {
    return new Promise((resolve) => {
      if (robotInfo.value) {
        const robot = robotInfo.value.robots.get(robotId);
        if (robot) {
          stopTeleopApi(robotId, robot.service).then((res: ServicesData) => {
            robot.service = "";
            logger.debug(`stop robot ${robotId} - ${res.service_id} success`);
            resolve(true);
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  };

  return { robotInfo, startRobot, getRobot, stopRobot };
});

export function useRobotStoreHook() {
  return useRobotStore(store);
}
