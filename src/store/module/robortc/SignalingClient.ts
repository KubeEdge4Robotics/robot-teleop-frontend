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

import { io, Socket } from "socket.io-client";

import {
  type SignalingServerConfiguration,
  RTCClient,
  PeerCallReceivedData,
  PeerAnswerReceivedData,
  IceCandidateReceivedData,
} from "@/apis/types/robortc";
import Logger from "@/utils/logger";
import Constants from "@/utils/constants";

export default abstract class SignalingClient {
  _socket_id: string;
  _rtcConfiguration: RTCConfiguration;
  _offerOptions: RTCOfferOptions;
  _signalingServerConfiguration: SignalingServerConfiguration;
  _logger: Logger;
  _socket: Socket | null;
  _clients: Array<RTCClient>;
  _rtcPeerConnections: Map<string, RTCPeerConnection>;
  _alreadyAcceptedCalls: Array<string>;

  constructor(signalingServerConfiguration: SignalingServerConfiguration) {
    if (this.constructor === SignalingClient) {
      throw new TypeError(
        'Abstract class "SignalingClient" cannot be instantiated directly.'
      );
    }
    if (!window.RTCPeerConnection) {
      throw new Error("RTCPeerConnection is not supported.");
    }

    if (!window.RTCSessionDescription) {
      throw new Error("RTCSessionDescription is not supported.");
    }
    const { iceServers } = signalingServerConfiguration;
    this._socket_id = "";
    this._rtcConfiguration = { iceServers: iceServers };
    this._signalingServerConfiguration = signalingServerConfiguration;
    this._logger = Logger.getInstance();
    this._socket = null;
    this._clients = [];
    this._rtcPeerConnections = new Map();
    this._alreadyAcceptedCalls = [];
    this._offerOptions = {};
  }

  abstract _createRtcPeerConnection(
    id: string,
    isCaller?: boolean,
    config?: RTCConfiguration
  ): RTCPeerConnection;

  async connect() {
    this._logger.debug("SignalingClient.connect method call");
    const url = new URL(this._signalingServerConfiguration.url);
    // remove trailing slash
    let path = url.pathname.replace(/\/$/, "");
    const _url = url.protocol + "//" + url.hostname + ":" + url.port;
    const authToken: string = Constants.SECRET;
    const authKey: string = Constants.TELEOP_SERVER_AUTH_KEY;
    if (!path.endsWith("/socket.io")) {
      path += "/socket.io";
    }
    const query = new Map<string, string>();
    query.set("token", this._signalingServerConfiguration.token || "");
    if (authToken && authKey) query.set(authKey, authToken);
    this._socket = io(_url, { path: path, query: query });

    this._connectEvents();
    await new Promise((resolve, reject) => {
      if (this._socket === null) {
        throw new Error("SignalingClient.connect: socket is undefined");
      }
      this._socket.on("connect", () => {
        this._logger.debug("SignalingServer connect event");
        resolve(true);
      });
      this._socket.on("connect_error", (error) => {
        this._logger.error("SignalingServer connect_error event");
        reject(error);
      });
      this._socket.on("connect_timeout", (error) => {
        this._logger.debug("SignalingServer connect_timeout event");
        reject(error);
      });
    });
    const client_name =
      this._signalingServerConfiguration.name +
      "." +
      this._signalingServerConfiguration.room;
    const data = {
      name: client_name,
      type: "console",
      room: this._signalingServerConfiguration.room,
      roomId: this._signalingServerConfiguration.roomId,
      role: this._signalingServerConfiguration.role,
      data: this._signalingServerConfiguration.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this._socket.emit("join-room", data, (isJoined: string) => {
      self._logger.info(
        `SignalingServer join-room event, isJoined=${isJoined}`
      );
      if (isJoined) {
        self._socket_id = isJoined;
        self._onSignalingConnectionOpen();
      } else {
        self.close();
        self._onSignalingConnectionError(
          "Invalid token or invalid protocol version"
        );
      }
    });
  }

  close() {
    if (this._socket !== null) {
      this._disconnect();
    }
    // The RTC peer connections need to close after the socket because of socket can create a RTC connection after
    // RTC peer connections closing.
    this._closeAllRtcPeerConnections();
  }

  hangUpAll() {
    this._logger.debug("SignalingClient.hangUpAll method call");
    this._closeAllRtcPeerConnections();
    // this.updateRoomClients();
  }

  updateRoomClients() {
    this._onRoomClientsChange(this._addConnectionStateToClients(this._clients));
  }

  callAll() {
    if (!this._socket) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    this._logger.debug("SignalingClient.callAll method call");

    this._alreadyAcceptedCalls = this._clients.map((client) => client.id);
    this._socket.emit("call-all");
  }

  callIds(ids: Array<string>) {
    if (!this._socket) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    this._alreadyAcceptedCalls = ids;
    this._socket.emit("call-ids", ids);
  }

  _connectEvents() {
    if (this._socket === null) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }

    this._socket.on("disconnect", () => {
      this._disconnect();
    });

    this._socket.on("room-clients", (clients) => {
      this._clients = clients;
      this.updateRoomClients();
    });

    this._socket.on(
      "make-peer-call",
      async (ids) => await this._makePeerCall(ids)
    );
    this._socket.on(
      "peer-call-received",
      async (data) => await this._peerCallReceived(data)
    );
    this._socket.on(
      "peer-call-answer-received",
      async (data) => await this._peerCallAnswerReceived(data)
    );
    this._socket.on("close-all-peer-connections-request-received", () => {
      this.hangUpAll();
    });

    this._socket.on(
      "ice-candidate-received",
      async (data) => await this._addIceCandidate(data)
    );
  }

  _disconnectRtcPeerConnectionEvents(rtcPeerConnection: RTCPeerConnection) {
    rtcPeerConnection.onicecandidate = () => {};
    rtcPeerConnection.onconnectionstatechange = () => {};
  }

  _removeConnection(id: string) {
    const rtcPeerConnection = this._rtcPeerConnections.get(id);
    if (rtcPeerConnection) {
      rtcPeerConnection.close();
      this._disconnectRtcPeerConnectionEvents(rtcPeerConnection);
      this._rtcPeerConnections.delete(id);
      this._alreadyAcceptedCalls = this._alreadyAcceptedCalls.filter(
        (x) => x != id
      );
      this._onClientDisconnect(id);
    }
  }

  _disconnectEvents() {
    if (this._socket === null) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    this._socket.off("connect");
    this._socket.off("connect_error");
    this._socket.off("connect_timeout");
    this._socket.off("disconnect");
    this._socket.off("room-clients");
    this._socket.off("make-peer-call");
    this._socket.off("peer-call-received");
    this._socket.off("peer-call-answer-received");

    this._getAllRtcPeerConnection().forEach((c) =>
      this._disconnectRtcPeerConnectionEvents(c)
    );
    this._socket.off("ice-candidate");
  }

  _hasRtcPeerConnection(id: string) {
    return id in this._rtcPeerConnections;
  }

  _disconnect() {
    if (this._socket === null) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    this._disconnectEvents();
    this._socket.close();
    this._socket = null;
    this._clients = [];
    this._alreadyAcceptedCalls = [];
    this.close();
    this._onSignalingConnectionClose();
  }

  _onSignalingConnectionOpen() {
    // this._logger.debug("SignalingClient._onSignalingConnectionOpen method call");
  }

  _onSignalingConnectionClose() {
    // this._logger.debug(
    //   "SignalingClient._onSignalingConnectionClose method call"
    // );
  }

  _onSignalingConnectionError(...message: any[]) {
    this._logger.debug(
      "SignalingClient._onSignalingConnectionError method call, message=",
      message
    );
  }

  _onRoomClientsChange = (clients: RTCClient[]) => {
    // update clients
    this._clients = clients;
  };

  _onClientConnect = (id: string) => {
    this._logger.debug("SignalingClient._onClientConnect method call, id=", id);
  };

  _onClientDisconnect = (id: string) => {
    this._logger.debug(
      "SignalingClient._onClientDisconnect method call, id=",
      id
    );
  };

  _callAcceptor = (id: string) => {
    this._logger.debug("SignalingClient._callAcceptor method call, id=", id);
    if (id.length > 0) return true;
    return false;
  };

  _onCallReject = (id: string) => {
    this._logger.debug("SignalingClient._onCallReject method call, id=", id);
  };

  _getAllRtcPeerConnection() {
    return Array.from(this._rtcPeerConnections.values());
  }

  _closeAllRtcPeerConnections() {
    this._getAllRtcPeerConnection().forEach((c) => {
      this._disconnectRtcPeerConnectionEvents(c);
      c.close();
    });
    this._alreadyAcceptedCalls = [];
    this._rtcPeerConnections.clear();
  }

  _connectRtcPeerConnectionEvents(
    id: string,
    rtcPeerConnection: RTCPeerConnection
  ) {
    if (!this._socket) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    rtcPeerConnection.onicecandidate = (event) => {
      this._socket?.emit("send-ice-candidate", {
        toId: id,
        candidate: event.candidate,
      });
    };

    rtcPeerConnection.onconnectionstatechange = () => {
      this._logger.info(
        "RtcPeerConnection connected event id=",
        id,
        rtcPeerConnection.connectionState
      );
      switch (rtcPeerConnection.connectionState) {
        case "connected":
          this._onClientConnect(id);
          break;

        case "disconnected":
        case "failed":
        case "closed":
          this._logger.warn(
            "RtcPeerConnection disconnected, failed or closed event, id=",
            id
          );

          this._removeConnection(id);
          this.updateRoomClients();
          break;
      }
    };
  }

  _addConnectionStateToClients(clients: Array<RTCClient>) {
    const newClients: Array<RTCClient> = [];
    clients.forEach((client) => {
      newClients.push({
        id: client.id,
        name: client.name,
        type: client.type,
        isConnected:
          this._hasRtcPeerConnection(client.id) || client.id == this._socket_id,
      } as RTCClient);
    });
    return newClients;
  }

  async _getCallAcceptance(id: string) {
    if (this._alreadyAcceptedCalls.includes(id)) {
      return true;
    }

    let response = this._callAcceptor(id);
    // @ts-ignore
    if (response && typeof response.then === "function") {
      response = await response;
    }
    return response;
  }

  async _peerCallAnswerReceived(data: PeerAnswerReceivedData) {
    this._logger.debug(
      "SignalingServer peer-call-answer-received event, data=",
      data
    );

    if (data.answer) {
      const rtcPeerConnection = this._rtcPeerConnections.get(data.fromId);
      try {
        await rtcPeerConnection?.setRemoteDescription(
          new window.RTCSessionDescription(data.answer)
        );
      } catch (e) {
        this._logger.error(
          "SignalingServer peer-call-answer-received event, error=",
          e
        );
      }
    } else {
      this._onCallReject(data.fromId);
      this._removeConnection(data.fromId);
    }
  }

  async _addIceCandidate(data: IceCandidateReceivedData) {
    this._logger.debug(
      "SignalingServer ice-candidate-received event, data=",
      data
    );
    const rtcPeerConnection = this._rtcPeerConnections.get(data.fromId);
    if (data.candidate && rtcPeerConnection) {
      rtcPeerConnection.addIceCandidate(data.candidate).catch((e) => {
        this._logger.error(
          "SignalingServer ice-candidate-received event, error=",
          e
        );
      });
    }
  }

  async _peerCallReceived(data: PeerCallReceivedData) {
    if (!this._socket) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    if (await this._getCallAcceptance(data.fromId)) {
      const rtcPeerConnection: RTCPeerConnection =
        this._createRtcPeerConnection(data.fromId, false);
      this._rtcPeerConnections.set(data.fromId, rtcPeerConnection);
      this._connectRtcPeerConnectionEvents(data.fromId, rtcPeerConnection);

      await rtcPeerConnection.setRemoteDescription(
        new window.RTCSessionDescription(data.offer)
      );

      const answer = await rtcPeerConnection.createAnswer();
      await rtcPeerConnection.setLocalDescription(
        new window.RTCSessionDescription(answer)
      );
      this._socket.emit("make-peer-call-answer", {
        toId: data.fromId,
        answer: answer,
      });
    } else {
      this._socket.emit("make-peer-call-answer", { toId: data.fromId });
    }
  }

  async _makePeerCall(ids: Array<string>) {
    if (!this._socket) {
      throw new Error("SignalingClient._connectEvents: socket is undefined");
    }
    this._logger.debug("SignalingServer make-peer-call event, ids=", ids);
    for (const id of ids) {
      if (id === this._socket_id || this._hasRtcPeerConnection(id)) {
        continue;
      }
      const shouldAccept = await this._getCallAcceptance(id);
      if (shouldAccept) {
        const rtcPeerConnection: RTCPeerConnection =
          this._createRtcPeerConnection(id, true);
        this._rtcPeerConnections.set(id, rtcPeerConnection);
        this._connectRtcPeerConnectionEvents(id, rtcPeerConnection);

        const offer = await rtcPeerConnection.createOffer(this._offerOptions);
        await rtcPeerConnection.setLocalDescription(
          new RTCSessionDescription(offer)
        );
        this._socket.emit("call-peer", { toId: id, offer: offer });
      } else {
        this._onCallReject(id);
      }
    }
  }

  set onSignalingConnectionOpen(onSignalingConnectionOpen: () => void) {
    this._onSignalingConnectionOpen = onSignalingConnectionOpen;
  }
  set onSignalingConnectionClose(onSignalingConnectionClose: () => void) {
    this._onSignalingConnectionClose = onSignalingConnectionClose;
  }
  set onSignalingConnectionError(
    onSignalingConnectionError: (...message: any[]) => void
  ) {
    this._onSignalingConnectionError = onSignalingConnectionError;
  }
  set onRoomClientsChange(onRoomClientsChange: (clients: RTCClient[]) => void) {
    this._onRoomClientsChange = onRoomClientsChange;
  }
  set callAcceptor(callAcceptor: () => boolean) {
    this._callAcceptor = callAcceptor;
  }
  set onClientConnect(onClientConnect: () => void) {
    this._onClientConnect = onClientConnect;
  }
  set onClientDisconnect(onClientDisconnect: () => void) {
    this._onClientDisconnect = onClientDisconnect;
  }
  set SignalingServerConfiguration(
    signalingServerConfiguration: SignalingServerConfiguration
  ) {
    this._signalingServerConfiguration = signalingServerConfiguration;
  }
}
