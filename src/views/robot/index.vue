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
  <div class="app-container">
    <div v-loading="loading">
      <el-empty description="no data" v-show="paginationData.total === 0" />
      <template v-if="paginationData.total > 0">
        <el-row :gutter="16">
          <el-col
            v-for="robot in robotList"
            :key="robot.robot_id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <Card
              :robot="robot"
              @start-teleop="handleStartRobot"
              @stop-teleop="handleStopRobot"
            />
          </el-col>
        </el-row>
        <el-pagination
          class="float-right"
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { listRobotApi } from "@/apis/service";
import { type RobotData } from "@/apis/types/service";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { usePagination } from "@/components/Pagination/usePagination";
import Card from "@/components/Card/index.vue";
import { useRobotStore } from "@/store/module/robot";
import { useUserStoreHook } from "@/store/module/user";

const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();
const robotList = ref<RobotData[]>([]);
const loading = ref(true);
const router = useRouter();
const robotStore = useRobotStore();
const userStore = useUserStoreHook();

const getRobotListData = () => {
  loading.value = true;
  listRobotApi({
    offset: paginationData.offset,
    limit: paginationData.pageSize,
  })
    .then((res) => {
      paginationData.total = res.total;
      robotList.value = res.robots || [];
    })
    .catch(() => {
      robotList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleStartRobot = (robot: RobotData) => {
  loading.value = true;
  const user = userStore.userInfo;
  robotStore
    .startRobot(robot, user?.name || "control")
    .then(() => {
      router.push({
        path: "/teleop/" + robot.robot_id,
      });
    })
    .catch(() => {
      ElMessage.error("Start robot failed");
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleStopRobot = (robot: RobotData) => {
  ElMessageBox.confirm(`try to stop ${robot.robot_name}, confirm ?`, "Notice", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(() => {
    loading.value = true;
    robotStore
      .stopRobot(robot.robot_id)
      .then(() => {
        ElMessage.success("Stop robot successfully");
      })
      .catch(() => {
        ElMessage.error("Stop robot failed");
      })
      .finally(() => {
        loading.value = false;
        getRobotListData();
      });
  });
};

onMounted(() => {
  getRobotListData();
});
</script>
