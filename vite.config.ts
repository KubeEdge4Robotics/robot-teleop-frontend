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

import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import svgLoader from "vite-svg-loader";
import UnoCSS from "unocss/vite";

export default (configEnv: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(
    configEnv.mode,
    process.cwd(),
    "TELEOP_"
  ) as ImportMetaEnv;
  const { TELEOP_PUBLIC_PATH, TELEOP_SERVER_URL } = viteEnv;
  return {
    base: TELEOP_PUBLIC_PATH,
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      https: false,
      host: "0.0.0.0",
      port: 3333,
      open: false,
      cors: true,
      strictPort: false,
      proxy: {
        "/v1": {
          target: TELEOP_SERVER_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/v1/, ""),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ["console.log"],
        },
        format: {
          comments: false,
        },
      },
      assetsDir: "static",
    },
    plugins: [
      vue(),
      vueJsx(),
      svgLoader({ defaultImport: "url" }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
      }),
      UnoCSS(),
    ],
    define: {
      "process.env": {},
    },
  };
};
