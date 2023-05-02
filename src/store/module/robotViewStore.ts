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
import { ref } from "vue";
import { defineStore } from "pinia";
import { type RouteLocationNormalized } from "vue-router";

export type ITagView = Partial<RouteLocationNormalized>;

export const useRobotViewStore = defineStore("routers-view", () => {
  const visitedViews = ref<ITagView[]>([]);
  const cachedViews = ref<string[]>([]);
  const permRouters = ref<ITagView[]>([]);

  const addPermRouters = (view: ITagView) => {
    if (
      permRouters.value.some((v, index) => {
        if (v.path === view.path) {
          if (v.fullPath !== view.fullPath) {
            permRouters.value[index] = Object.assign({}, view);
          }
          return true;
        }
      })
    ) {
      return;
    }
    permRouters.value.push(Object.assign({}, view));
  };

  const delPermRouters = (view: ITagView) => {
    for (const [i, v] of permRouters.value.entries()) {
      if (v.path === view.path) {
        permRouters.value.splice(i, 1);
        break;
      }
    }
  };

  const addVisitedView = (view: ITagView) => {
    if (
      visitedViews.value.some((v, index) => {
        if (v.path === view.path) {
          if (v.fullPath !== view.fullPath) {
            visitedViews.value[index] = Object.assign({}, view);
          }
          return true;
        }
      })
    ) {
      return;
    }
    visitedViews.value.push(Object.assign({}, view));
  };
  const addCachedView = (view: ITagView) => {
    if (typeof view.name !== "string") return;
    if (cachedViews.value.includes(view.name)) return;
    if (view.meta?.keepAlive) {
      cachedViews.value.push(view.name);
    }
  };

  const delVisitedView = (view: ITagView) => {
    for (const [i, v] of visitedViews.value.entries()) {
      if (v.path === view.path) {
        visitedViews.value.splice(i, 1);
        break;
      }
    }
  };
  const delCachedView = (view: ITagView) => {
    if (typeof view.name !== "string") return;
    const index = cachedViews.value.indexOf(view.name);
    index > -1 && cachedViews.value.splice(index, 1);
  };

  const delOthersVisitedViews = (view: ITagView) => {
    visitedViews.value = visitedViews.value.filter((v) => {
      return v.meta?.affix || v.path === view.path;
    });
  };
  const delOthersCachedViews = (view: ITagView) => {
    if (typeof view.name !== "string") return;
    const index = cachedViews.value.indexOf(view.name);
    if (index > -1) {
      cachedViews.value = cachedViews.value.slice(index, index + 1);
    } else {
      cachedViews.value = [];
    }
  };

  const delAllVisitedViews = () => {
    const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix);
    visitedViews.value = affixTags;
  };
  const delAllCachedViews = () => {
    cachedViews.value = [];
  };
  const delAllPermRouters = () => {
    permRouters.value = [];
  };

  return {
    visitedViews,
    cachedViews,
    permRouters,
    addPermRouters,
    delPermRouters,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delAllPermRouters,
    delOthersVisitedViews,
    delOthersCachedViews,
    delAllVisitedViews,
    delAllCachedViews,
  };
});
