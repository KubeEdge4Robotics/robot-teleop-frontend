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

import {
  type RouteRecordRaw,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUserStoreHook } from "@/store/module/user";
import { getToken, removeToken } from "@/utils/storage";

NProgress.configure({ showSpinner: false });

const Layout = () => import("@/layout/index.vue");

export const Routes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: {
      hidden: true,
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/error-page/redirect.vue"),
        meta: {
          hidden: true,
        },
      },
    ],
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/permissionError.vue"),
    meta: {
      hidden: true,
    },
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/notFound.vue"),
    meta: {
      hidden: true,
    },
    alias: "/:pathMatch(.*)*",
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true,
    },
  },
  {
    path: "/",
    name: "home",
    component: Layout,
    redirect: "/robot",
    meta: {
      title: "Home",
      svgIcon: "home",
      level: 0,
      perm: true,
    },
    children: [
      {
        path: "robot",
        component: () => import("@/views/robot/index.vue"),
        name: "Robots",
        meta: {
          title: "Robots",
          svgIcon: "robot-online",
          level: 1,
          affix: false,
          perm: true,
        },
      },
      {
        path: "teleop/:robot_id",
        component: () => import("@/views/teleop/index.vue"),
        name: "Teleoperation",
        props: true,
        meta: {
          title: "Teleoperation",
          keepAlive: true,
          hidden: true,
          level: 1,
          perm: true,
        },
      },
    ],
  },
  {
    path: "/service",
    name: "service",
    component: Layout,
    redirect: "/service/list",
    meta: {
      title: "Service",
      svgIcon: "service",
      level: 0,
      perm: true,
    },
    children: [
      {
        path: "list",
        component: () => import("@/views/service/index.vue"),
        name: "Service",
        meta: {
          title: "Service",
          svgIcon: "service",
          level: 1,
          affix: false,
          perm: true,
        },
      },
    ],
  },
  {
    path: "/docs",
    name: "docs",
    component: Layout,
    redirect: "/docs/kubeedge",
    meta: {
      title: "Documents",
      svgIcon: "documentation",
      level: 0,
      perm: false,
    },
    children: [
      {
        path: "kubeedge",
        name: "KubeEdge",
        component: () => import("@/views/docs/index.vue"),
        meta: {
          title: "KubeEdge",
          svgIcon: "documentation",
          frameSrc: "https://kubeedge.io/en/",
          level: 1,
          affix: false,
          perm: false,
        },
      },
    ],
  },
];

const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === "hash"
      ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
      : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: Routes,
});
const whiteList = [
  "/login", // login
  "/redirect", // redirect
  "/404", // 404
  "/403", // 403
];
const userStore = useUserStoreHook();
router.getRoutes().forEach((route) => {
  if (whiteList.indexOf(route.path) === -1 && route.meta?.level === 0) {
    userStore.add_perm_routes(route);
  }
});

router.beforeEach(async (to, _from, next) => {
  NProgress.start();
  if (getToken()) {
    if (to.path === "/login") {
      next({ path: "/", replace: true });
    } else {
      if (userStore.token) {
        next();
      } else {
        removeToken();
        next("/login");
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    }
    next("/login");
  }
});

router.afterEach(() => {
  NProgress.done();
});

export function resetRouter() {
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route;
      if (name && meta.perm) {
        router.hasRoute(name) && router.removeRoute(name);
      }
    });
  } catch (error) {
    window.location.reload();
  }
}

export default router;
