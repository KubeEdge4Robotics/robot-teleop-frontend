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

import { request } from "@/utils/service";
import {
  IGetRobotsRequestData,
  RobotResponseData,
  RobotData,
  ServicesData,
  ServicesResponseData,
} from "@/apis/types/service";

export function createServiceApi() {
  return request<ServicesData>({
    url: "service",
    method: "post",
  });
}

export function listServiceApi(data: IGetRobotsRequestData) {
  return request<ServicesResponseData>({
    url: "service",
    method: "get",
    data,
  });
}

export function deleteServiceApi(serviceId: string) {
  return request<ServicesData>({
    url: `service/${serviceId}`,
    method: "delete",
  });
}

export function getServiceApi(serviceId: string) {
  return request<ServicesData>({
    url: `service/${serviceId}`,
    method: "get",
  });
}

export function listRobotApi(data: IGetRobotsRequestData) {
  return request<RobotResponseData>({
    url: "robot",
    method: "get",
    data,
  });
}

export function getRobotApi(robotId: string) {
  return request<RobotData>({
    url: `robot/${robotId}`,
    method: "get",
  });
}

export function startTeleopApi(
  robotId: string,
  serviceId: string,
  userName: string
) {
  return request<ServicesData>({
    url: `robot/${robotId}/${serviceId}/start`,
    method: "post",
    data: {
      username: userName,
    },
  });
}

export function stopTeleopApi(robotId: string, serviceId: string) {
  return request<ServicesData>({
    url: `robot/${robotId}/${serviceId}/stop`,
    method: "post",
  });
}
