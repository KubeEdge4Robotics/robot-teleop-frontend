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

import { ref, watchEffect } from "vue";

const DEFAULT_THEME_NAME = "normal";
type DefaultThemeNameType = typeof DEFAULT_THEME_NAME;

export type ThemeName = DefaultThemeNameType | "dark" | "dark-blue";

interface IThemeList {
  title: string;
  name: ThemeName;
}

const themeList: IThemeList[] = [
  {
    title: "default",
    name: "normal",
  },
  {
    title: "dark",
    name: "dark",
  },
  {
    title: "blue",
    name: "dark-blue",
  },
];

const activeThemeName = ref<ThemeName>(DEFAULT_THEME_NAME);

const setTheme = (value: ThemeName) => {
  activeThemeName.value = value;
};

const setHtmlClassName = (value: ThemeName) => {
  document.documentElement.className = value;
};

const initTheme = () => {
  watchEffect(() => {
    const value = activeThemeName.value;
    setHtmlClassName(value);
    // setActiveThemeName(value)
  });
};

export function themeManage() {
  return { themeList, activeThemeName, initTheme, setTheme };
}
