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

enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  public static getInstance(logLevel: LogLevel = LogLevel.DEBUG): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel);
    }
    return Logger.instance;
  }

  private getTimeStamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, ...args: any[]): void {
    if (this.logLevel <= level) {
      const levelString = LogLevel[level].toUpperCase();
      const timestamp = this.getTimeStamp();
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`[${timestamp}] [${levelString}]`, ...args);
          break;
        case LogLevel.INFO:
          console.info(`[${timestamp}] [${levelString}]`, ...args);
          break;
        case LogLevel.WARN:
          console.warn(`[${timestamp}] [${levelString}]`, ...args);
          break;
        case LogLevel.ERROR:
          console.error(`[${timestamp}] [${levelString}]`, ...args);
          break;
        default:
          console.log(`[${timestamp}] [${levelString}]`, ...args);
      }
    }
  }

  public debug(...message: any[]): void {
    this.log(LogLevel.DEBUG, ...message);
  }

  public info(...message: any[]): void {
    this.log(LogLevel.INFO, ...message);
  }

  public warn(...message: any[]): void {
    this.log(LogLevel.WARN, ...message);
  }

  public error(...message: any[]): void {
    this.log(LogLevel.ERROR, ...message);
  }
}

export default Logger;
