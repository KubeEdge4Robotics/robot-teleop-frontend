/*
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
 */

import { reactive } from "vue";

interface IDefaultPaginationData {
  total: number;
  offset: number;
  currentPage: number;
  pageSizes: number[];
  pageSize: number;
  layout: string;
}

interface IPaginationData {
  total?: number;
  offset?: number;
  currentPage?: number;
  pageSizes?: number[];
  pageSize?: number;
  layout?: string;
}

const defaultPaginationData: IDefaultPaginationData = {
  total: 0,
  offset: 0,
  currentPage: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: "total, sizes, prev, pager, next, jumper",
};

export function usePagination(_paginationData: IPaginationData = {}) {
  const paginationData = reactive(
    Object.assign({ ...defaultPaginationData }, _paginationData)
  );

  const handleCurrentChange = (value: number) => {
    paginationData.currentPage = value;
    paginationData.offset = (value - 1) * paginationData.pageSize;
  };

  const handleSizeChange = (value: number) => {
    paginationData.pageSize = value;
  };

  return { paginationData, handleCurrentChange, handleSizeChange };
}
