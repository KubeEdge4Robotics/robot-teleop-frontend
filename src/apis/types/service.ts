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

export interface IceServerData {
  urls: string;
  username: string | null;
  credential: string | null;
  password: string | null;
}

export interface RoomData {
  room_id: string;
  room_name: string;
  room_type: string;
  max_users: number;
  role?: string;
}

export interface RoomResponseData {
  service_id: string;
  rooms: Map<string, RoomData>;
}

export interface ServicesData {
  service_id: string;
  token: string;
  user_id: string | null;
  ice_server: IceServerData;
  rooms: RoomResponseData | null;
  status: string | null;
  create_time: string | null;
  update_time: string | null;
}

export interface ServicesResponseData {
  services: ServicesData[];
  total: number;
}

export interface ApplicationData {
  app_id: string;
  version: string | null;
  status: string | null;
  message: string | null;
}

export interface IGetRobotsRequestData {
  offset: number;
  limit: number;
  name?: string;
}

export interface SkillData {
  skill_id: string;
  skill_name: string;
  skill_type: string | null;
  version: string | null;
  description: string | null;
  parameters: Map<string, string> | null;
}

export interface cameraData {
  camera_id: string;
  camera_name: string;
  camera_type: string | null;
  camera_url: string | null;
  camera_status: string;
  stream?: MediaStream;
}

export interface RobotData {
  robot_id: string;
  service_id: string | null;
  robot_name: string | null;
  robot_type: string | null;
  status: string | null;
  camera_num: number;
  pcl_support: boolean;
  audio_support: boolean;
  control: string | null;
  skills: Array<SkillData>;
  camera: Array<cameraData>;
  applications: Map<string, RoomData>;
}

export interface RobotResponseData {
  robots: RobotData[];
  total: number;
}

export interface robotInfoData {
  id: string;
  name: string;
  type: string;
  service: string;
  token: string;
  status: string;
  iceServers: RTCIceServer[];
  rooms: Map<string, RoomData> | null;
  camera: Array<cameraData>;
  camera_num: number;
  pcl_support: boolean;
  audio_support: boolean;
  control?: string;
  skills: Array<SkillData>;
}

export interface allRobotInfoData {
  robots: Map<string, robotInfoData>;
  count: number;
}
