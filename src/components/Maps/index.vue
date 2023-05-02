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
    class="map-container widget"
    v-loading="loading"
    v-bind:class="{ big: isExpanded, small: !isExpanded }"
    ref="mapContainer"
  >
    <div class="header" id="map-header">
      <div class="title">Map</div>
      <button
        class="icon-button right expand-button-icon"
        type="button"
        @click="toggleExpand"
      >
        <svg-icon v-show="isExpanded" name="minimize" />
        <svg-icon v-show="!isExpanded" name="expand" />
      </button>
    </div>
    <canvas ref="mapCanvas" id="map" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from "vue";

interface MapState {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  isDragging: boolean;
  lastX: number | null;
  lastY: number | null;
  currentX: number | null;
  currentY: number | null;
  scale: number;
}

const props = defineProps({
  stream: {
    type: MediaStream,
    default: null,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
});
const loading = ref(true);
const mapCanvas = ref<HTMLCanvasElement>();
const isExpanded = ref(props.isExpanded);
const mapState = reactive<MapState>({
  canvas: null,
  context: null,
  isDragging: false,
  lastX: null,
  lastY: null,
  currentX: null,
  currentY: null,
  scale: 1,
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleMouseDown = (event: MouseEvent) => {
  mapState.isDragging = true;
  mapState.lastX = event.clientX;
  mapState.lastY = event.clientY;
};

const handleMouseUp = () => {
  mapState.isDragging = false;
};

const handleMouseMove = (event: MouseEvent) => {
  if (mapState.isDragging) {
    mapState.currentX = event.clientX;
    mapState.currentY = event.clientY;
    const deltaX = mapState.currentX - mapState.lastX!;
    const deltaY = mapState.currentY - mapState.lastY!;
    mapState.lastX = mapState.currentX;
    mapState.lastY = mapState.currentY;
    mapState.context!.translate(deltaX, deltaY);
    drawMap();
  }
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  const delta = event.deltaY;
  const zoomSpeed = 0.1;
  const zoomDirection = delta > 0 ? -1 : 1;
  const oldScale = mapState.scale;
  mapState.scale += zoomSpeed * zoomDirection;
  mapState.scale = Math.max(1, mapState.scale);
  mapState.context!.scale(mapState.scale / oldScale, mapState.scale / oldScale);
  drawMap();
};

const drawMap = () => {
  const { canvas, context } = mapState;
  if (!canvas || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const image = document.getElementById("map") as HTMLVideoElement;
  image.srcObject = props.stream;
  image.onload = () => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
};

onMounted(() => {
  const canvas = mapCanvas.value;
  if (!canvas) return;
  const context = canvas.getContext("2d");
  mapState.canvas = canvas;
  mapState.context = context;
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("wheel", handleWheel);
  drawMap();
});

onUnmounted(() => {
  const canvas = mapCanvas.value;
  if (!canvas) return;
  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mouseup", handleMouseUp);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("wheel", handleWheel);
});
</script>
