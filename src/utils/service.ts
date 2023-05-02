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

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import { get } from "lodash-es";
import { getToken, removeToken } from "@/utils/storage";
import Constants from "./constants";

function createService() {
  const service = axios.create();
  service.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );
  service.interceptors.response.use(
    (response) => {
      const apiData = response.data as any;
      return apiData;
    },
    (error) => {
      const status = get(error, "response.status");
      switch (status) {
        case 400:
          error.message = "Request Error";
          break;
        case 403:
          error.message = "Access Refuse";
          removeToken();
          break;
        case 404:
          error.message = `Request Address Error: ${error.response.config.url}`;
          break;
        case 408:
          error.message = "Request Timeout";
          break;
        case 500:
          error.message = "Server Error";
          break;
        case 501:
          error.message = "Service Not Implemented";
          break;
        case 502:
          error.message = "Gateway Error";
          break;
        case 503:
          error.message = "Service Unavailable";
          break;
        case 504:
          error.message = "Gateway Timeout";
          break;
        case 505:
          error.message = "HTTP Version Not Supported";
          break;
        default:
          break;
      }
      ElMessage.error(error.message);
      return Promise.reject(error);
    }
  );
  return service;
}

function createRequestFunction(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    let headers = {
      Authorization: "Bearer " + getToken(),
      "Content-Type": get(config, "headers.Content-Type", "application/json"),
    };
    const authKey: string = Constants.TELEOP_SERVER_AUTH_KEY,
      authToken: string = Constants.SECRET;
    if (authKey && authToken) {
      headers = Object.assign(headers, { authKey: authToken });
    }
    const configDefault = {
      headers: headers,
      timeout: 50000,
      baseURL: Constants.TELEOP_SERVER_URL,
      data: {},
    };
    const request_config = Object.assign(configDefault, config);
    return service(request_config);
  };
}

export const service = createService();
export const request = createRequestFunction(service);
