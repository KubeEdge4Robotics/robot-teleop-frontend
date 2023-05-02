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

import Cookies from "js-cookie";

// get service tilte from env, default is KubeEdge

export const ServiceTilte =
  import.meta.env.TELEOP_APP_SERVICE_TITLE || "KubeEdge";

/**
 * Get the value of a cookie. Return defaultValue if the cookie does not exist.
 * @param {String} key - Name of the cookie.
 * @param {*} defaultValue - Default value.
 * @returns {*} The value of the cookie or the default value.
 */
export function getCookies(key, defaultValue) {
  const cookieValue = Cookies.get(key);
  return cookieValue ? JSON.parse(cookieValue) : defaultValue;
}

/**
 * Set the value of a cookie.
 * @param {String} key - Name of the cookie.
 * @param {*} value - Value of the cookie.
 */
export function setCookies(key, value) {
  Cookies.set(key, JSON.stringify(value));
}

/**
 * Remove a cookie.
 * @param {String} key - Name of the cookie.
 */
export function removeCookies(key) {
  Cookies.remove(key);
}

/**
 * Get the value of the token cookie.
 * @returns {String} The value of the token cookie.
 */
export function getToken() {
  return getCookies(ServiceTilte);
}

/**
 * Set the value of the token cookie.
 * @param {String} token - The value of the token.
 */
export function setToken(token) {
  setCookies(ServiceTilte, token);
}

/**
 * Remove the token cookie.
 */
export function removeToken() {
  removeCookies(ServiceTilte);
}
