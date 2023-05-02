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

import { v4 as uuidv4 } from "uuid";
import { getToken, removeToken } from "@/utils/storage";
import { CryptService } from "@/utils/cipher";
import Logger from "@/utils/logger";
import { userInfoData } from "@/apis/types/user";
import Constants from "@/utils/constants";

const cryptService = new CryptService();

/**
 * @method addUserLogin login
 * @param {*} username, password
 * @returns
 */
export function addUserLogin(username: string, password: string) {
  // check if password lowcase echo api secret in env
  const sysToken = password.toLowerCase();
  const logger = Logger.getInstance();
  if (sysToken !== Constants.SECRET.toLowerCase()) {
    return Promise.reject("Password is incorrect");
  }
  let jwtToken: string = getToken() || "";
  let userInfo: userInfoData | undefined = undefined;
  if (jwtToken) {
    try {
      const userdata = cryptService.decryptOne(jwtToken);
      if (userdata) {
        userInfo = JSON.parse(userdata) as userInfoData;
        if (userInfo.name !== username) {
          logger.error("User %s already logged in", userInfo.name);
          removeToken();
        } else {
          return Promise.resolve({
            data: {
              token: jwtToken,
              userInfo: userInfo,
            },
          });
        }
      }
    } catch (e) {
      logger.error(e);
      removeToken();
    }
  }

  const uid: string = uuidv4(),
    token: string = cryptService.encryptOne(sysToken);

  userInfo = { id: uid, name: username, token: token } as userInfoData;
  jwtToken = cryptService.encryptOne(JSON.stringify(userInfo));

  return Promise.resolve({
    data: {
      token: jwtToken,
      userInfo: userInfo,
    },
  });
}
