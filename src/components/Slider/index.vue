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
  <div class="slidercontainer">
    <input
      type="range"
      min="1"
      max="100"
      value="80"
      class="slider"
      id="Sensitivity"
      onkeydown="event.preventDefault()"
      @input="onInput"
    />
    <div class="text">Sensitivity: {{ speed }}%</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const speed = ref(0);
const emit = defineEmits(["maxSpeedChangedEvent"]);

const onInput = () => {
  speed.value = parseInt(
    (document.getElementById("Sensitivity") as HTMLInputElement).value
  );
  emitMaxSpeedChanged();
};

const emitMaxSpeedChanged = () => {
  const maxSpeed = speed.value / 100;
  emit("maxSpeedChangedEvent", maxSpeed);
};

onMounted(() => {
  onInput();
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
