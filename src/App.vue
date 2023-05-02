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

<script lang="ts" setup>
import { h } from "vue";
import { themeManage } from "@/components/Theme/themeManage";
import { ElNotification } from "element-plus";
import Constants from "@/utils/constants";

const { initTheme } = themeManage();

initTheme();

ElNotification({
  title: "Announcement",
  message: h(
    "a",
    {
      style: "color: teal",
      target: "_blank",
      href: Constants.SOURCE_URL,
    },
    "Copyright 2021 The KubeEdge Authors."
  ),
  position: "bottom-right",
});
</script>

<template>
  <ElConfigProvider>
    <router-view />
  </ElConfigProvider>
</template>
