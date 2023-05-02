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
  <div @click="click">
    <el-tooltip effect="dark" :content="tips" placement="bottom">
      <svg-icon :name="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" />
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import screenfull from "screenfull";

const props = defineProps({
  element: {
    type: String,
    default: "html",
  },
  openTips: {
    type: String,
    default: "fullscreen",
  },
  exitTips: {
    type: String,
    default: "exit fullscreen",
  },
});

const tips = ref<string>(props.openTips);
const isFullscreen = ref<boolean>(false);

const click = () => {
  const dom = document.querySelector(props.element) || undefined;
  if (!screenfull.isEnabled) {
    ElMessage.warning("Your browser does not support fullscreen!");
    return;
  }
  screenfull.toggle(dom);
};

const change = () => {
  isFullscreen.value = screenfull.isFullscreen;
  tips.value = screenfull.isFullscreen ? props.exitTips : props.openTips;
};

screenfull.on("change", change);

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off("change", change);
  }
});
</script>

<style lang="scss" scoped>
@import "./useResize.scss";
</style>
