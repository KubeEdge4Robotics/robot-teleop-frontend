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
  <div class="login-container">
    <ThemeSwitch class="theme-switch" />
    <div class="login-card">
      <div class="title">
        <img src="@/assets/logo-text.png" />
      </div>
      <div class="content">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginFormRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginForm.username"
              placeholder="Please input username"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginForm.password"
              placeholder="Contact the Administrator to get the AuthToken"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            @click.prevent="handleLogin"
          >
            Login
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/module/user";
import { User, Lock } from "@element-plus/icons-vue";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import { type FormInstance, FormRules } from "element-plus";
import { type ILoginRequestData } from "@/apis/types/user";

const router = useRouter();
const loginFormRef = ref<FormInstance | null>(null);

const loading = ref(false);

const loginForm: ILoginRequestData = reactive({
  username: "admin",
  password: "admin",
});

const loginFormRules: FormRules = {
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: "Contact the Administrator to get the AuthToken",
      trigger: "blur",
    },
    { min: 4, message: "Minimum length is 4", trigger: "blur" },
  ],
};

const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      useUserStore()
        .login({
          username: loginForm.username,
          password: loginForm.password,
        })
        .then(() => {
          router.push({ path: "/" });
        })
        .catch(() => {
          loginForm.password = "";
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
