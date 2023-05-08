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
  <div v-loading="loading">
    <div class="teleop-fluid">
      <el-empty
        v-if="robot?.status !== 'running'"
        description="Robot status invalid"
      />
      <div class="fluid row-flexbox" v-else>
        <div
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @mousemove="onMouseMove"
          @mouseout="onMouseOut"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchEnd="onTouchEnd"
        >
          <RoboStatus
            v-bind:datachannel="teleopDataChannel"
            v-bind:roboname="robot.name"
          />
          <div
            class="col-flexbox"
            :class="{ col33: isMapExpanded, col100: !isMapExpanded }"
          >
            <div v-for="(camera, index) in videoCameras" v-bind:key="index">
              <div
                v-if="cameraDisplayMode === 0 || cameraDisplayMode === index"
              >
                <Video
                  v-if="camera.stream"
                  v-bind:camera="camera"
                  v-bind:volume="sessionVolume"
                />
              </div>
            </div>
          </div>
          <div
            class="col-flexbox"
            :class="{ col66: isMapExpanded }"
            v-if="mapStream"
          >
            <Maps v-bind:isExpanded="isMapExpanded" v-bind:stream="mapStream" />
          </div>
        </div>
        <Slider
          v-on:maxSpeedChangedEvent="onMaxSpeedChanged"
          v-show="showControls && readySend"
        />
        <joystick
          v-bind:absolute-max-x="Velocity.scaledMaxX"
          v-bind:absolute-max-yaw="Velocity.scaledMaxYaw"
          v-on:joystickPositionChange="updateCmdVel"
          v-show="showControls && readySend"
        />
        <Keyboard
          v-bind:absolute-max-x="Velocity.scaledMaxX"
          v-bind:absolute-max-yaw="Velocity.scaledMaxYaw"
          v-bind:enabled="showControls && readySend"
          v-on:keyboardEvent="updateCmdVel"
        />
        <div v-on:mouseenter="showToolbar" ref="toolbarRef" class="toolbar">
          <Toolbar
            :robo="robot"
            :showControls="showControls"
            :readySend="readySend"
            @controlChangedEvent="onControlChanged"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getRobotApi } from "@/apis/service";
import {
  type robotInfoData,
  RobotData,
  cameraData,
} from "@/apis/types/service";
import { useRobotStore } from "@/store/module/robot";
import { useUserStoreHook } from "@/store/module/user";
import { useRoboRTCStoreHook } from "@/store/module/roboRTCStore.js";
import StreamClientStore from "@/store/module/robortc/streamClientStore";
import DataChannelClinetStore from "@/store/module/robortc/dcClientStore";
import Video from "@/components/Video/index.vue";
import Maps from "@/components/Maps/index.vue";
import Slider from "@/components/Slider/index.vue";
import joystick from "@/components/Joystick/index.vue";
import Keyboard from "@/components/Keyboard/index.vue";
import Toolbar from "@/components/Toolbar/index.vue";
import RoboStatus from "@/components/RoboStatus/index.vue";

const loading = ref(true);
const robotStore = useRobotStore();
const userStore = useUserStoreHook();
const rtcStore = useRoboRTCStoreHook();
const props = defineProps({
  robot_id: {
    type: String,
    required: true,
  },
});
const robot = ref<robotInfoData | undefined>();
const cameraDisplayMode = ref(0);
const showControls = ref(false);
const readySend = ref(false);
const toolbarRef = ref<HTMLElement>();
const toolbarTimeout = ref<number | null>(null);
const isMapExpanded = ref(false);
const videoCameras = ref<cameraData[]>();
const mapStream = ref<MediaStream>();
const teleopDataChannel = ref<DataChannelClinetStore>();
const sessionVolume = ref(0.5);
const robotSessionVolume = ref(0.5);
const interval = ref<number>();

const Velocity = {
  scaledMaxX: 0.8,
  scaledMaxYaw: 0.8,
  maxX: 0.8,
  maxYaw: 0.8,
};
const curr_cmd = {
  x: 0,
  yaw: 0,
};

const showToolbar = (): void => {
  if (typeof toolbarRef.value === "undefined") {
    return;
  }
  if (toolbarTimeout.value) {
    clearTimeout(toolbarTimeout.value);
    toolbarTimeout.value = null;
  } else {
    // @ts-ignore
    toolbarRef.value.style.height = "var(--hovering-height)";
  }
  toolbarTimeout.value = window.setTimeout((): void => {
    // @ts-ignore
    toolbarRef.value.style.height = "var(--default-height)";
    toolbarTimeout.value = null;
  }, 5000);
};

const initialPage = async () => {
  loading.value = true;
  robotStore
    .getRobot(props.robot_id)
    .then(async (res) => {
      robot.value = res as robotInfoData;
      if (!robot.value) {
        const user = userStore.userInfo;
        await getRobotApi(props.robot_id).then(async (res) => {
          const my_robot = res as RobotData;
          await robotStore
            .startRobot(my_robot, user?.name || "control")
            .then(async () => {
              await robotStore.getRobot(props.robot_id).then((res) => {
                robot.value = res as robotInfoData;
              });
            });
        });
      }
    })
    .catch((err) => {
      ElMessage.error("Start robot failed", err);
    })
    .finally(async () => {
      loading.value = false;
      if (!robot.value) {
        ElMessage.error("Start robot failed");
        return;
      }
      videoCameras.value = robot.value.camera;
      rtcStore.initialize(robot.value);
      await rtcStore.start().then(() => {
        emitLoop();
      });
    });
};

const updateRtc = async () => {
  if (!videoCameras.value) {
    return;
  }
  for (const camera of videoCameras.value) {
    const clientStream = rtcStore.modules.get(
      camera.camera_name.toLocaleLowerCase()
    );
    if (clientStream && clientStream instanceof StreamClientStore) {
      // @ts-ignore
      if (clientStream.stream && clientStream.stream !== camera.stream)
        camera.stream = clientStream.stream;
    }
  }
  // map stream
  const mapStreamClient = rtcStore.modules.get("map");
  if (mapStreamClient && mapStreamClient instanceof StreamClientStore) {
    // @ts-ignore
    mapStream.value = mapStreamClient.stream;
  }
  // teleop datachannel
  const tmp = rtcStore.modules.get("teleop");
  if (tmp && tmp instanceof DataChannelClinetStore) {
    teleopDataChannel.value = tmp;
    const readyState = teleopDataChannel.value.dataChannel?.readyState;
    if (readyState === "open") {
      readySend.value = true;
    } else {
      readySend.value = false;
      showControls.value = false;
    }
  }
};

const emitLoop = () => {
  interval.value = window.setInterval(function () {
    updateRtc();
  }, 1000);
};

const updateCmdVel = (newCmd: { x: number; yaw: number }) => {
  curr_cmd.x = newCmd.x;
  curr_cmd.yaw = newCmd.yaw;
  if (!teleopDataChannel.value?.dataChannel) return;
  const status = teleopDataChannel.value.status;
  if (readySend.value && status?.isTeleopOn) {
    const msg = {
      x: (curr_cmd.x ? curr_cmd.x : 0) * Velocity.scaledMaxX,
      yaw: (curr_cmd.yaw ? curr_cmd.yaw : 0) * Velocity.scaledMaxX,
      type: "velCmd",
    };
    teleopDataChannel.value.send(msg);
  } else {
    console.warn("datachannel is not ready");
  }
};

const onControlChanged = (control: string, value: any) => {
  console.debug("onControlChanged", control, value);
  switch (control) {
    case "cameraDisplayMode":
      cameraDisplayMode.value = value ? 1 : 0;
      break;
    case "showControls":
      showControls.value = value;
      break;
    case "setSessionMicVolume":
      sessionVolume.value = value;
      break;
    case "setRobotVolume":
      robotSessionVolume.value = value;
      break;
    default:
      break;
  }
};
const onMaxSpeedChanged = (maxSpeed: number) => {
  console.debug("onMaxSpeedChanged", maxSpeed);
  Velocity.scaledMaxX = Velocity.maxX * maxSpeed;
  Velocity.scaledMaxYaw = Velocity.maxYaw * maxSpeed;
};
const onMouseDown = (event: MouseEvent) => {
  // console.log("onMouseDown", event);
};
const onMouseUp = (e: MouseEvent) => {
  // console.log("onMouseUp", e);
};
const onMouseMove = (e: MouseEvent) => {
  // console.log("onMouseMove", e);
};
const onMouseOut = (e: MouseEvent) => {
  // console.log("onMouseOut", e);
};
const onTouchStart = (e: TouchEvent) => {
  // console.log("onTouchStart", e);
};
const onTouchMove = (e: TouchEvent) => {
  // console.log("onTouchMove", e);
};
const onTouchEnd = (e: TouchEvent) => {
  // console.log("onTouchEnd", e);
};

const initialWebRTC = async () => {
  await initialPage();
};

onMounted(initialWebRTC);
</script>

<style scoped>
@import "./index.scss";
</style>
