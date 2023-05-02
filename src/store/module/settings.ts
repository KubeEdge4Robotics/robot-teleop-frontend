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

import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { getSidebarStatus, setSidebarStatus } from "@/utils/cache";

export enum DeviceType {
  Mobile,
  Desktop,
}

interface ISidebar {
  opened: boolean;
  withoutAnimation: boolean;
}

interface ILayoutSettings {
  showSettings: boolean;
  showTagsView: boolean;
  showSidebarLogo: boolean;
  fixedHeader: boolean;
  showNotify: boolean;
  showThemeSwitch: boolean;
  showScreenfull: boolean;
  showGreyMode: boolean;
  showColorWeakness: boolean;
}

const layoutSettings: ILayoutSettings = {
  showSettings: true,
  showTagsView: true,
  fixedHeader: true,
  showSidebarLogo: true,
  showNotify: true,
  showThemeSwitch: true,
  showScreenfull: true,
  showGreyMode: false,
  showColorWeakness: false,
};

export const useAppStore = defineStore("app", () => {
  const sidebar: ISidebar = reactive({
    opened: getSidebarStatus() !== "closed",
    withoutAnimation: false,
  });
  const device = ref<DeviceType>(DeviceType.Desktop);

  const toggleSidebar = (withoutAnimation: boolean) => {
    sidebar.opened = !sidebar.opened;
    sidebar.withoutAnimation = withoutAnimation;
    if (sidebar.opened) {
      setSidebarStatus("opened");
    } else {
      setSidebarStatus("closed");
    }
  };
  const closeSidebar = (withoutAnimation: boolean) => {
    sidebar.opened = false;
    sidebar.withoutAnimation = withoutAnimation;
    setSidebarStatus("closed");
  };
  const toggleDevice = (value: DeviceType) => {
    device.value = value;
  };

  return { device, sidebar, toggleSidebar, closeSidebar, toggleDevice };
});

export const useSettingsStore = defineStore("settings", () => {
  const fixedHeader = ref<boolean>(layoutSettings.fixedHeader);
  const showSettings = ref<boolean>(layoutSettings.showSettings);
  const showTagsView = ref<boolean>(layoutSettings.showTagsView);
  const showSidebarLogo = ref<boolean>(layoutSettings.showSidebarLogo);
  const showNotify = ref<boolean>(layoutSettings.showNotify);
  const showThemeSwitch = ref<boolean>(layoutSettings.showThemeSwitch);
  const showScreenfull = ref<boolean>(layoutSettings.showScreenfull);
  const showGreyMode = ref<boolean>(layoutSettings.showGreyMode);
  const showColorWeakness = ref<boolean>(layoutSettings.showColorWeakness);

  return {
    fixedHeader,
    showSettings,
    showTagsView,
    showSidebarLogo,
    showNotify,
    showThemeSwitch,
    showScreenfull,
    showGreyMode,
    showColorWeakness,
  };
});
