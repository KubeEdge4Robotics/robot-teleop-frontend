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
import { getToken, removeToken, setToken } from "@/utils/storage";
import { addUserLogin } from "@/apis/user";
import { resetRouter } from "@/router";
import { type ITagView, useRobotViewStore } from "./robotViewStore";
import store from "@/store";

import { type ILoginRequestData } from "@/apis/types/user";
import { type userInfoData } from "@/apis/types/user";
import Logger from "@/utils/logger";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "");
  const userInfo = ref<userInfoData>();
  const logger = Logger.getInstance();

  const tagsViewStore = useRobotViewStore();

  const add_perm_routes = (view: ITagView) => {
    tagsViewStore.addPermRouters(view);
  };

  const login = (loginData: ILoginRequestData) => {
    return new Promise((resolve, reject) => {
      const { username, password } = loginData;
      logger.info("login accout", loginData);
      addUserLogin(username.trim(), password.trim())
        .then((res) => {
          logger.debug("login res", res);
          setToken(res.data.token);
          token.value = res.data.token;
          userInfo.value = res.data.userInfo as userInfoData;
          resolve(true);
        })
        .catch((error) => {
          logger.error(error);
          reject(error);
        });
    });
  };

  const logout = () => {
    removeToken();
    token.value = "";
    userInfo.value = undefined;
    resetRouter();
    _resetTagsView();
  };

  const resetToken = () => {
    removeToken();
    token.value = "";
  };

  const _resetTagsView = () => {
    tagsViewStore.delAllVisitedViews();
    tagsViewStore.delAllCachedViews();
    tagsViewStore.delAllPermRouters();
  };

  return { token, userInfo, add_perm_routes, login, logout, resetToken };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
