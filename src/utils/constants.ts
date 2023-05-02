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

class Constants {
  static SERVICE_TITLE = import.meta.env.TELEOP_APP_SERVICE_TITLE || "KubeEdge";
  static SOURCE_URL =
    import.meta.env.TELEOP_APP_SOURCE_URL ||
    "https://github.com/KubeEdge/community";
  static TOKEN = `${Constants.SERVICE_TITLE}-token`;
  static SIDEBAR_STATUS = `${Constants.SERVICE_TITLE}-sidebar-status`;
  static ACTIVE_THEME_NAME = `${Constants.SERVICE_TITLE}-active-theme-name`;
  static SECRET = import.meta.env.TELEOP_SERVER_AUTH_TOKEN || "KubeEdgeSecret";
  static ENCTYPTED_SALT = import.meta.env.ENCTYPTED_SALT || "";
  static ENCTYPTED_SECRET = import.meta.env.ENCTYPTED_SECRET || "KubeEdge";
  static TELEOP_SERVER_URL =
    import.meta.env.TELEOP_SERVER_URL || "http://127.0.0.1:3333/v1";
  static TELEOP_SERVER_AUTH_KEY = import.meta.env.TELEOP_SERVER_AUTH_KEY || "";
}

export default Constants;
