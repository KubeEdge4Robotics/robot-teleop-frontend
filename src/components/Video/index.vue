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
  <div class="video-container flex-container">
    <div class="name-layout">
      <span class="name-text">{{ camera.camera_name }}</span>
    </div>
    <div v-loading="loading">
      <video
        ref="videoRef"
        v-bind:id="camera.camera_id"
        class="video-layout"
        autoplay
        disablePictureInPicture
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType, onMounted } from "vue";
import { type cameraData } from "@/apis/types/service";

const loading = ref(true);
const props = defineProps({
  camera: {
    type: Object as PropType<cameraData>,
    required: true,
  },
  volume: {
    type: Number,
    defualt: 1,
  },
});
const videoRef = ref<HTMLVideoElement>();

onMounted(() => {
  videoRef.value = document.getElementById(
    props.camera.camera_id
  ) as HTMLVideoElement;
  if (props.camera.stream) {
    videoRef.value.srcObject = props.camera.stream;
    videoRef.value.volume = props.volume || 0;
    loading.value = false;
  } else {
    // show loading while media stream is not ready
    loading.value = true;
  }
});
</script>
<style lang="scss" scoped>
@import "./index.scss";
</style>
