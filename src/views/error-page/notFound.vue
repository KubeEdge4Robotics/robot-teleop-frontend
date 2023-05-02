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
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img class="pic-404__parent" src="@/assets/images/404.png" alt="404" />
        <img
          class="pic-404__child left"
          src="@/assets/images/404.png"
          alt="404"
        />
        <img
          class="pic-404__child mid"
          src="@/assets/images/404.png"
          alt="404"
        />
        <img
          class="pic-404__child right"
          src="@/assets/images/404.png"
          alt="404"
        />
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">OOPS!</div>
        <div class="bullshit__info">
          Copyright 2021 The
          <a style="color: #20a0ff" :href="sourceUrl" target="_blank"
            >KubeEdge</a
          >
          Authors.
        </div>
        <div class="bullshit__headline">{{ message }}</div>
        <div class="bullshit__info">
          Please check that the URL you entered is correct, or click the button
          below to return to the homepage.
        </div>
        <a href="/" class="bullshit__return-home">Back to home</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs } from "vue";
import Constants from "@/utils/constants";

const state = reactive({
  message: "Here means that you can not enter this page...",
});
const { message } = toRefs(state);
const sourceUrl = Constants.SOURCE_URL;
</script>
<style lang="scss" scoped>
@import "./index.scss";
</style>
