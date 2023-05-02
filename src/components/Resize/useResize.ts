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

import { watch, onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useAppStore, DeviceType } from "@/store/module/settings";

const WIDTH = 992; // refer to Bootstrap's responsive design

export default () => {
  const route = useRoute();
  const appStore = useAppStore();

  const _isMobile = () => {
    const rect = document.body.getBoundingClientRect();
    return rect.width - 1 < WIDTH;
  };

  const _resizeHandler = () => {
    if (!document.hidden) {
      const isMobile = _isMobile();
      appStore.toggleDevice(isMobile ? DeviceType.Mobile : DeviceType.Desktop);
      if (isMobile) {
        appStore.closeSidebar(true);
      }
    }
  };

  watch(
    () => route.name,
    () => {
      if (appStore.device === DeviceType.Mobile && appStore.sidebar.opened) {
        appStore.closeSidebar(false);
      }
    }
  );

  onBeforeMount(() => {
    window.addEventListener("resize", _resizeHandler);
  });

  onMounted(() => {
    if (_isMobile()) {
      appStore.toggleDevice(DeviceType.Mobile);
      appStore.closeSidebar(true);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", _resizeHandler);
  });
};
