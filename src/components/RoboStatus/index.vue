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
  <div class="navbar bg-secondary-dark">
    <div class="container-fluid">
      <div class="robot-usage">
        <div class="usage">
          <div class="usage-title">CPU</div>
          <div
            class="usage-text"
            :class="{
              high: cpuUsage > 70,
              low: cpuUsage < 30,
            }"
          >
            {{ cpuUsage.toFixed(2) }}%
          </div>
        </div>
        <div class="usage">
          <div class="usage-title">Memory</div>
          <div
            class="usage-text"
            :class="{
              high: memoryUsage > 70,
              low: memoryUsage < 30,
            }"
          >
            {{ memoryUsage.toFixed(2) }}%
          </div>
        </div>
      </div>
      <div class="navbar-brand">{{ roboname }}</div>
      <button
        class="icon-button navbar-toggler"
        type="button"
        v-on:click="navToggler"
      >
        <svg-icon name="list" class="navbar-toggler-icon" />
      </button>
      <div class="flex-container navbar-collapse" v-show="showNav">
        <div class="signal-bars">
          <div
            class="first-bar bar"
            v-bind:class="{ good: signalBars >= 20 }"
          />
          <div
            class="second-bar bar"
            v-bind:class="{ good: signalBars >= 40 }"
          />
          <div
            class="third-bar bar"
            v-bind:class="{ good: signalBars >= 60 }"
          />
          <div
            class="fourth-bar bar"
            v-bind:class="{ good: signalBars >= 80 }"
          />
          <div
            class="fifth-bar bar"
            v-bind:class="{ good: signalBars >= 100 }"
          />
        </div>
        <div class="battery-indicator">
          <div class="battery">
            <div class="top" />
            <div class="outer">
              <div
                v-for="n in 10"
                v-bind:key="n"
                class="inner"
                v-bind:class="{
                  unfill: n <= 10 - chargeBars,
                  low: chargeBars < 3,
                  good: chargeBars > 7,
                }"
              />
            </div>
          </div>
          <div class="percentage-box">
            <div class="percentage">{{ batteryLevel }}%</div>
          </div>
        </div>
        <button
          class="action-button"
          v-bind:class="label"
          :disabled="!teleopDataChannel"
          type="button"
          v-on:click="onClick"
        >
          <div>{{ label }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType, onUpdated, onUnmounted } from "vue";
import DataChannelClinetStore from "@/store/module/robortc/dcClientStore";
import { RoboStatus } from "@/apis/types/robortc";

const props = defineProps({
  roboname: {
    type: String,
    default: "Teleoperation",
  },
  datachannel: {
    type: Object as PropType<DataChannelClinetStore>,
    default: null,
  },
});
const teleopDataChannel = ref<DataChannelClinetStore>(props.datachannel);
const showNav = ref<boolean>(true);
const signalBars = ref<number>(2);
const chargeBars = ref<number>(1);
const batteryLevel = ref<number>(10);
const cpuUsage = ref<number>(0);
const memoryUsage = ref<number>(0);
const loopIntervalId = ref<number>(0);
const label = ref<string>("Stop");

const navToggler = () => {
  showNav.value = !showNav.value;
};

const onClick = () => {
  if (label.value === "Start") {
    teleopDataChannel.value?.startTeleop();
    label.value = "Stop";
  } else {
    teleopDataChannel.value?.stopTeleop();
    label.value = "Start";
  }
};

// listen to datachannel

const listenToDataChannel = () => {
  if (teleopDataChannel.value) {
    const status = teleopDataChannel.value.status as RoboStatus;
    if (!status) {
      return;
    }
    signalBars.value = status.wifiStrength || 0;
    batteryLevel.value = status.battery || 0;
    chargeBars.value = Math.ceil(batteryLevel.value / 10);
    cpuUsage.value = status.cpuUsage || 0;
    memoryUsage.value = status.memUsage || 0;
    label.value = status.isTeleopOn ? "Stop" : "Start";
  }
};

onUpdated(() => {
  teleopDataChannel.value = props.datachannel;
  loopIntervalId.value = window.setInterval(() => {
    listenToDataChannel();
  }, 1000);
});

onUnmounted(() => {
  window.clearInterval(loopIntervalId.value);
});
</script>
<style scoped>
@import "./index.scss";
</style>
