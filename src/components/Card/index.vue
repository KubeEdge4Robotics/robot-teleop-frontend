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
  <div :class="cardClass">
    <div class="list-card-item_detail bg-primary">
      <el-row justify="space-between">
        <div :class="cardLogoClass">
          <el-badge
            is-dot
            class="item"
            :type="robot?.status === 'RUNNING' ? 'success' : 'danger'"
          >
            <SvgIcon name="robot-online" />
          </el-badge>
        </div>
        <div class="list-card-item_detail--operation">
          <el-button
            type="success"
            v-if="!robot?.control"
            class="list-card-item_detail--operation--btn"
            @click="handleClickStart(robot)"
            :disabled="robot?.status !== 'RUNNING'"
            >Start</el-button
          >
          <el-button
            type="danger"
            v-else
            class="list-card-item_detail--operation--btn"
            @click="handleClickStop(robot)"
            :disabled="robot?.status !== 'RUNNING'"
            >Stop</el-button
          >
        </div>
      </el-row>
      <p class="list-card-item_detail--name text-text_color_primary">
        {{ robot?.robot_name }}
      </p>
      <el-descriptions direction="vertical" :column="1" border>
        <el-descriptions-item label="Robot ID">{{
          robot?.robot_id || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Robot Status">
          <el-tag
            :color="robot?.status === 'RUNNING' ? '#00a870' : '#eee'"
            effect="dark"
            class="mx-1 list-card-item_detail--operation--tag"
          >
            {{ robot?.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Robot Type">{{
          robot?.robot_type || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Service ID">{{
          robot?.service_id || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Camera Number">{{
          robot?.camera_num || 0
        }}</el-descriptions-item>
        <el-descriptions-item label="PointCloud Support">{{
          robot?.pcl_support ? "Support" : "Not Support"
        }}</el-descriptions-item>
        <el-descriptions-item label="Aduio Support">{{
          robot?.audio_support ? "Support" : "Not Support"
        }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import { type RobotData } from "@/apis/types/service";
import Logger from "@/utils/logger";

const logger = Logger.getInstance();
const emit = defineEmits(["start-teleop", "stop-teleop"]);

const props = defineProps({
  robot: {
    type: Object as PropType<RobotData>,
    required: true,
  },
});

const handleClickStart = (robot: RobotData) => {
  logger.debug("start teleop", robot.robot_id);
  emit("start-teleop", robot);
};

const handleClickStop = (robot: RobotData) => {
  logger.debug("stop teleop", robot.robot_id);
  emit("stop-teleop", robot);
};

const cardClass = computed(() => [
  "list-card-item",
  { "list-card-item__disabled": props.robot?.status !== "RUNNING" },
]);

const cardLogoClass = computed(() => [
  "list-card-item_detail--logo",
  {
    "list-card-item_detail--logo__disabled": props.robot?.status !== "RUNNING",
  },
]);
</script>
<style lang="scss" scoped>
@import "./index.scss";
</style>
