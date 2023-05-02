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
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd"
            >Add new Service</el-button
          >
        </div>
        <div>
          <el-tooltip content="Refresh">
            <el-button
              type="primary"
              :icon="RefreshRight"
              circle
              @click="handleRefresh"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column prop="service_id" label="ID" align="center" />
          <el-table-column prop="token" label="Token" align="center">
            <template #default="scope">
              <span v-show="scope.row.show">{{ scope.row.token }}</span>
              <span v-show="!scope.row.show">********</span>
              <span class="rt show-pwd" @click="format_pwd(scope.$index)">
                <svg-icon :name="scope.row.show ? 'eye' : 'eye-open'" />
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 'active'" effect="plain">
                {{ scope.row.status }}
              </el-tag>
              <el-tag v-else type="warning" effect="plain">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="Create" align="center" />
          <el-table-column prop="update_time" label="Update" align="center" />
          <el-table-column
            fixed="right"
            label="Action"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="danger"
                text
                bg
                size="small"
                @click="handleStop(scope.row)"
                v-bind:disabled="scope.row.status === 'active'"
                >Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import {
  listServiceApi,
  deleteServiceApi,
  createServiceApi,
} from "@/apis/service";
import { type ServicesData, ServicesResponseData } from "@/apis/types/service";
import { CirclePlus, RefreshRight } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { usePagination } from "@/components/Pagination/usePagination";

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();
const tableData = ref<ServicesData[]>([]);

const getTableData = () => {
  loading.value = true;
  listServiceApi({
    offset: paginationData.offset,
    limit: paginationData.pageSize,
  })
    .then((res: ServicesResponseData) => {
      paginationData.total = res.total;
      tableData.value = res.services;
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleRefresh = () => {
  getTableData();
};
const handleAdd = () => {
  ElMessageBox.confirm("Try to create an new Service, confirm ?", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "success",
  }).then(() => {
    createServiceApi().then(() => {
      ElMessage.success("Create successfully");
      getTableData();
    });
  });
};
const format_pwd = (index: number) => {
  // @ts-ignore
  tableData.value[index].show = !tableData.value[index].show;
};

const handleStop = (row: ServicesData) => {
  ElMessageBox.confirm(
    `Try to delete Service：${row.service_id}, confirm`,
    "Notice",
    {
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  ).then(() => {
    deleteServiceApi(row.service_id).then(() => {
      ElMessage.success("Delete successfully");
      getTableData();
    });
  });
};

watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  getTableData,
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
