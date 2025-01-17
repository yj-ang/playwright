/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { FullConfig, TestStatus, TestError } from './test';
export type { FullConfig, TestStatus, TestError } from './test';

export interface Location {
  file: string;
  line: number;
  column: number;
}

export interface Suite {
  title: string;
  location?: Location;
  suites: Suite[];
  tests: TestCase[];
  titlePath(): string[];
  allTests(): TestCase[];
}

export interface TestCase {
  title: string;
  location: Location;
  titlePath(): string[];
  expectedStatus: TestStatus;
  timeout: number;
  annotations: { type: string, description?: string }[];
  retries: number;
  results: TestResult[];
  outcome(): 'skipped' | 'expected' | 'unexpected' | 'flaky';
  ok(): boolean;
}

export interface TestResult {
  retry: number;
  workerIndex: number;
  startTime: Date;
  duration: number;
  status: TestStatus;
  error?: TestError;
  attachments: { name: string, path?: string, body?: Buffer, contentType: string }[];
  stdout: (string | Buffer)[];
  stderr: (string | Buffer)[];
}

/**
 * Result of the full test run.
 */
export interface FullResult {
  /**
   * Status:
   *   - 'passed' - everything went as expected.
   *   - 'failed' - any test has failed.
   *   - 'timedout' - the global time has been reached.
   *   - 'interrupted' - interrupted by the user.
   */
  status: 'passed' | 'failed' | 'timedout' | 'interrupted';
}

export interface Reporter {
  onBegin?(config: FullConfig, suite: Suite): void;
  onTestBegin?(test: TestCase): void;
  onStdOut?(chunk: string | Buffer, test?: TestCase): void;
  onStdErr?(chunk: string | Buffer, test?: TestCase): void;
  onTestEnd?(test: TestCase, result: TestResult): void;
  onError?(error: TestError): void;
  onEnd?(result: FullResult): void | Promise<void>;
}

// This is required to not export everything by default. See https://github.com/Microsoft/TypeScript/issues/19545#issuecomment-340490459
export {};
