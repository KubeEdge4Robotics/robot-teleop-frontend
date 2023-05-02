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
  <div />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface Velocity {
  x: number;
  yaw: number;
}

const props = defineProps({
  absoluteMaxX: {
    // Maximum linear velocity in m/s
    type: Number,
    required: true,
  },
  absoluteMaxYaw: {
    // Maximum angular velocity in rad/s
    type: Number,
    required: true,
  },
  publishingRate: {
    type: Number,
    required: false,
    default: 10, // Hz
  },
  enabled: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["keyboardEvent"]);
const cmd = ref<Velocity>({ x: 0, yaw: 0 });
const interval = ref<number>();

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === "ArrowUp") {
    cmd.value.x = props.absoluteMaxX;
  } else if (event.key === "ArrowDown") {
    cmd.value.x = -props.absoluteMaxX;
  } else if (event.key === "ArrowRight") {
    cmd.value.yaw = -props.absoluteMaxYaw;
  } else if (event.key === "ArrowLeft") {
    cmd.value.yaw = props.absoluteMaxYaw;
  }
  if (!interval.value) {
    emitLoop();
  }
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    cmd.value.x = 0;
  } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    cmd.value.yaw = 0;
  }
  if (cmd.value.x === 0 && cmd.value.yaw === 0) {
    emitKeyboardCmd();
  }
};

const emitKeyboardCmd = () => {
  emit("keyboardEvent", cmd.value);
};

const emitLoop = () => {
  interval.value = window.setInterval(function () {
    emitKeyboardCmd();
    if (cmd.value.x == 0 && cmd.value.yaw == 0) {
      window.clearInterval(interval.value);
      interval.value = 0;
    }
  }, 1000 / props.publishingRate);
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
});
</script>
