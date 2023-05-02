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

/**
 * @brief Enumerates all media devices.
 * @returns {Promise<MediaDeviceInfo[]>}
 */
async function enumerate() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    throw new Error("enumerateDevices() is not supported.");
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("getUserMedia() is not supported.");
  }

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  return await navigator.mediaDevices.enumerateDevices();
}

/**
 * @brief Gets a stream that satisfies the constraints.
 * @param {Object} constraints See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * @returns {Promise<MediaStream>}
 */
async function getStream(constraints: MediaStreamConstraints) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("getUserMedia() is not supported.");
  }

  return await navigator.mediaDevices.getUserMedia(constraints);
}

/**
 * @brief Gets the default audio and video stream.
 * @returns {Promise<MediaStream>}
 */
async function getDefaultStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("getUserMedia() is not supported.");
  }

  return await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
}

/**
 * @brief Gets the default audio stream.
 * @returns {Promise<MediaStream>}
 */
async function getDefaultAudioStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("getUserMedia() is not supported.");
  }

  return await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
}

/**
 * @brief Gets the default video stream.
 * @returns {Promise<MediaStream>}
 */
async function getDefaultVideoStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("getUserMedia() is not supported.");
  }

  return await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
}

const devices = {
  enumerate,
  getStream,
  getDefaultStream,
  getDefaultAudioStream,
  getDefaultVideoStream,
};

export default devices;
