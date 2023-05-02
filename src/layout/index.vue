<!--
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
-->

<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="classObj.mobile && classObj.openSidebar"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <Sidebar class="sidebar-container" />
    <div :class="{ hasTagsView: showTagsView }" class="main-container">
      <div
        :class="{ 'fixed-header': fixedHeader, 'has-navi-view': showNaviView }"
        v-on:mouseenter="showNavigationBar"
        v-on:mouseleave="showNavigationBar"
      >
        <NavigationBar v-show="showNaviView" />
        <TagsView v-show="showTagsView" />
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  useAppStore,
  DeviceType,
  useSettingsStore,
} from "@/store/module/settings";

import { AppMain, NavigationBar, Sidebar, TagsView } from "./components";
import useResize from "@/components/Resize/useResize";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const showNaviView = ref(false);

useResize();

const showNavigationBar = () => {
  showNaviView.value = !showNaviView.value;
};

const classObj = computed(() => {
  return {
    hideSidebar: !appStore.sidebar.opened,
    openSidebar: appStore.sidebar.opened,
    withoutAnimation: appStore.sidebar.withoutAnimation,
    mobile: appStore.device === DeviceType.Mobile,
    showGreyMode: showGreyMode.value,
    showColorWeakness: showColorWeakness.value,
  };
});

const showTagsView = computed(() => {
  return settingsStore.showTagsView;
});
const fixedHeader = computed(() => {
  return settingsStore.fixedHeader;
});
const showGreyMode = computed(() => {
  return settingsStore.showGreyMode;
});
const showColorWeakness = computed(() => {
  return settingsStore.showColorWeakness;
});
const handleClickOutside = () => {
  appStore.closeSidebar(false);
};
</script>
<style lang="scss" scoped>
@import "@/assets/styles/mixins.scss";
@import "./index.scss";
</style>
