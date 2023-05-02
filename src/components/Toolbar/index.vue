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
  <div
    class="btn-toolbar"
    role="toolbar"
    aria-label="Toolbar with button groups"
  >
    <div class="btn-group" role="group" aria-label="Group button">
      <button
        type="button"
        class="btn btn-primary-dark"
        v-on:click="toggleShowControls"
      >
        <svg-icon name="show-controls" v-if="showControls && readySend" />
        <svg-icon name="hide-controls" v-else />
      </button>
      <div class="dropup">
        <button
          type="button"
          class="btn btn-primary-dark btn-dropup-middle"
          v-on:click="setSessionMicVolume(true)"
        >
          <svg-icon v-if="sessionMicVolume > 0" name="mic-fill" />
          <svg-icon v-else name="mic-mute-fill" />
        </button>
        <div class="dropup-content">
          <input
            type="range"
            min="0"
            max="1"
            value="1"
            step="0.01"
            class="slider"
            id="sessionMicVolumeSlider"
            @input="setSessionMicVolume(false)"
          />
        </div>
      </div>
      <button
        type="button"
        class="btn btn-primary-dark"
        v-on:click="toggleRobotCamera"
        v-if="isRobotSigleCamera"
      >
        <svg-icon name="camera-video-fill" v-if="isRobotCameraOn" />
        <svg-icon name="camera-video-off-fill" v-else />
      </button>
      <button
        type="button"
        class="btn btn-primary-dark"
        v-on:click="toggleCameraDisplayMode"
        v-else
      >
        <svg-icon name="both-cameras" v-if="cameraDisplayMode == 0" />
        <svg-icon name="top-camera-only" v-if="cameraDisplayMode == 1" />
        <svg-icon name="bottom-camera-only" v-if="cameraDisplayMode == 2" />
      </button>
      <div class="dropup">
        <button
          type="button"
          class="btn btn-primary-dark btn-dropup-right"
          v-on:click="setRobotVolume(true)"
        >
          <svg-icon v-if="robotVolume >= 0.5" name="volume-up-robot" />
          <svg-icon v-else-if="robotVolume == 0" name="volume-mute-robot" />
          <svg-icon v-else name="volume-down-robot" />
        </button>
        <div class="dropup-content">
          <input
            type="range"
            min="0"
            max="1"
            value="1"
            step="0.01"
            class="slider"
            id="robotVolumeSlider"
            @input="setRobotVolume(false)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType } from "vue";
import { type robotInfoData } from "@/apis/types/service";

const props = defineProps({
  robo: {
    type: Object as PropType<robotInfoData>,
    default: null,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
  readySend: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["controlChangedEvent"]);
const roboInfo = ref<robotInfoData | null>(props.robo);
const showControls = ref(props.showControls);
const sessionMicVolume = ref(1);
const isRobotCameraOn = ref(false);
const isRobotSigleCamera = ref(true);
if (roboInfo.value !== null) {
  isRobotCameraOn.value = roboInfo.value.camera_num > 0 ? true : false;
  isRobotSigleCamera.value = roboInfo.value.camera_num > 1 ? true : true;
}
const cameraDisplayMode = ref(0);
const robotVolume = ref(1);

const toggleShowControls = () => {
  showControls.value = !showControls.value;
  emit("controlChangedEvent", "showControls", showControls.value);
};
const setSessionMicVolume = (isClick: boolean) => {
  if (isClick) {
    sessionMicVolume.value = sessionMicVolume.value > 0 ? 0 : 1;
  } else {
    sessionMicVolume.value = parseFloat(
      (document.getElementById("sessionMicVolumeSlider") as HTMLInputElement)
        .value
    );
  }
  emit("controlChangedEvent", "setSessionMicVolume", sessionMicVolume.value);
};
const setRobotVolume = (isClick: boolean) => {
  if (isClick) {
    robotVolume.value = robotVolume.value > 0 ? 0 : 1;
  } else {
    robotVolume.value = parseFloat(
      (document.getElementById("robotVolumeSlider") as HTMLInputElement).value
    );
  }
  emit("controlChangedEvent", "setRobotVolume", robotVolume.value);
};
const toggleRobotCamera = () => {
  isRobotCameraOn.value = !isRobotCameraOn.value;
  const cameraNum = isRobotCameraOn.value ? 1 : 0;
  emit("controlChangedEvent", "toggleRobotCamera", cameraNum);
};
const toggleCameraDisplayMode = () => {
  cameraDisplayMode.value = (cameraDisplayMode.value + 1) % 3;
  emit("controlChangedEvent", "toggleRobotCamera", cameraDisplayMode.value);
};
</script>
<style scoped>
@import "./index.scss";
</style>
