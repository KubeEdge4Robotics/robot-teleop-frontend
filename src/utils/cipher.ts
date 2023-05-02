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

import sha256 from "crypto-js/sha256";
import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import AES from "crypto-js/aes";
import CBC from "crypto-js/mode-ecb";
import Pkcs7 from "crypto-js/pad-pkcs7";
import Constants from "./constants";

export interface TokenDto {
  iat: number;
  exp: number;
  sub: string;
  id: string;
  name: string;
  token: string;
}

export class Encrypted {
  data: string;
  hash: string;

  constructor(data: string, hash: string) {
    this.data = data;
    this.hash = hash;
  }

  getData(): string {
    return this.data;
  }

  getHash(): string {
    return this.hash;
  }
}

export class CryptService {
  salt: string = Constants.ENCTYPTED_SALT.substr(0, 16);
  key: string = Constants.ENCTYPTED_SECRET.substr(0, 16);

  decryptOne(hash: string): string {
    const message = AES.decrypt(hash, Utf8.parse(this.key), {
      iv: Utf8.parse(this.salt),
      mode: CBC,
      padding: Pkcs7,
    }).toString(Utf8);
    return message;
  }

  encryptOne(message: string): string {
    const data = AES.encrypt(message, Utf8.parse(this.key), {
      iv: Utf8.parse(this.salt),
      mode: CBC,
      padding: Pkcs7,
    }).toString();
    return data;
  }

  getHash(message: string): Encrypted {
    const hash = Base64.stringify(hmacSHA512(sha256(message), this.key));
    return new Encrypted(message, hash);
  }

  encrypt(data: any): any {
    const result: any = {};

    Object.keys(data).forEach((field) => {
      result[`${field}Hash`] = this.encryptOne(data[field]);
    });

    return result;
  }

  decrypt(encypted: any): any {
    const result: any = {};

    Object.keys(encypted).forEach((field) => {
      result[field] = this.decryptOne(encypted[field]);
    });

    return result;
  }
}
