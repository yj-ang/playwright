/**
 * Copyright Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  matcherHint,
  MatcherHintOptions
} from 'jest-matcher-utils';
import { Locator } from '../../..';
import { currentTestInfo } from '../globals';
import type { Expect } from '../types';
import { expectLocator, monotonicTime, pollUntilDeadline } from '../util';

export async function toBeTruthy<T>(
  this: ReturnType<Expect['getState']>,
  matcherName: string,
  locator: Locator,
  query: (timeout: number) => Promise<T>,
  options: { timeout?: number } = {},
) {
  const testInfo = currentTestInfo();
  if (!testInfo)
    throw new Error(`${matcherName} must be called during the test`);
  expectLocator(locator, matcherName);

  const matcherOptions: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };

  let received: T;
  let pass = false;
  const timeout = options.timeout === 0 ? 0 : options.timeout || testInfo.timeout;
  const deadline = timeout ? monotonicTime() + timeout : 0;

  // TODO: interrupt on timeout for nice message.
  await pollUntilDeadline(async () => {
    const remainingTime = deadline ? deadline - monotonicTime() : 0;
    received = await query(remainingTime);
    pass = !!received;
    return pass === !matcherOptions.isNot;
  }, deadline, 100);

  const message = () => {
    return matcherHint(matcherName, undefined, '', matcherOptions);
  };

  return { message, pass };
}
