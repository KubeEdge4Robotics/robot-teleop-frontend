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
  <transition name="fade-transform" mode="in-out">
    <div class="navigation-bar">
      <Hamburger
        :is-active="sidebar.opened"
        class="hamburger"
        @toggle-click="toggleSidebar"
      />
      <Breadcrumb class="breadcrumb" />
      <div class="right-menu">
        <useResize v-if="showScreenfull" class="right-menu-item" />
        <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" />
        <el-dropdown class="right-menu-item">
          <div class="right-menu-avatar">
            <el-avatar :icon="UserFilled" :size="30" />
            <span>{{ userStore.userInfo?.name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <a target="_blank" :href="sourceUrl">
                <el-dropdown-item>GitHub</el-dropdown-item>
              </a>
              <el-dropdown-item divided @click="logout">
                <span style="display: block">Logout</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore, useSettingsStore } from "@/store/module/settings";
import { useUserStore } from "@/store/module/user";
import { UserFilled } from "@element-plus/icons-vue";
import Breadcrumb from "./breadcrumb.vue";
import Hamburger from "./hamburger.vue";
import Constants from "@/utils/constants";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import useResize from "@/components/Resize/useResize.vue";

const router = useRouter();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const sourceUrl = Constants.SOURCE_URL;

const sidebar = computed(() => {
  return appStore.sidebar;
});

const showThemeSwitch = computed(() => {
  return settingsStore.showThemeSwitch;
});
const showScreenfull = computed(() => {
  return settingsStore.showScreenfull;
});

const toggleSidebar = () => {
  appStore.toggleSidebar(false);
};
const logout = () => {
  userStore.logout();
  router.push("/login");
};
</script>
<style lang="scss" scoped>
@import "./navigation.scss";
</style>
