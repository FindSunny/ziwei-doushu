import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  addAiQuota,
  consumeAiQuota,
  getAiQuotaStatus,
  releaseAiQuota,
  resetAiQuota,
} from '../../lib/ai-quota';
import { createDeepSeekResponse } from '../../lib/deepseek';

const temporaryDirectories: string[] = [];

async function useStore(limit: number): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ziwei-ai-quota-'));
  temporaryDirectories.push(directory);
  process.env.AI_QUOTA_STORE = path.join(directory, 'quota.json');
  process.env.AI_QUOTA_DAILY_LIMIT = String(limit);
  process.env.AI_QUOTA_CONTACT = '测试管理员';
  return directory;
}

async function run(): Promise<void> {
  await useStore(2);
  const day = new Date('2026-10-28T01:00:00.000Z');

  const initial = await getAiQuotaStatus(day);
  assert.equal(initial.limit, 2);
  assert.equal(initial.used, 0);
  assert.equal(initial.remaining, 2);
  assert.equal(initial.contact, '测试管理员');

  const first = await consumeAiQuota(day);
  const second = await consumeAiQuota(day);
  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal((await consumeAiQuota(day)).allowed, false);

  const previousKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-key';
  let upstreamCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    upstreamCalls += 1;
    throw new Error('超额时不应调用上游');
  }) as typeof fetch;
  const denied = await createDeepSeekResponse({
    system: 'test',
    messages: [{ role: 'user', content: 'test' }],
  });
  globalThis.fetch = originalFetch;
  if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = previousKey;

  assert.equal(denied.status, 429);
  assert.equal(upstreamCalls, 0);
  const deniedBody = await denied.json() as { code?: string; contact?: string };
  assert.equal(deniedBody.code, 'AI_QUOTA_EXHAUSTED');
  assert.equal(deniedBody.contact, '测试管理员');

  await useStore(1);
  process.env.DEEPSEEK_API_KEY = 'test-key';
  globalThis.fetch = (async () => {
    throw new Error('模拟上游连接失败');
  }) as typeof fetch;
  const originalConsoleError = console.error;
  console.error = () => {};
  let failed: Response;
  try {
    failed = await createDeepSeekResponse({
      system: 'test',
      messages: [{ role: 'user', content: 'test' }],
    });
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
  }
  if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = previousKey;
  assert.equal(failed.status, 502);
  assert.equal((await getAiQuotaStatus(day)).used, 0);

  await useStore(5);
  const concurrent = await Promise.all(Array.from({ length: 20 }, () => consumeAiQuota(day)));
  assert.equal(concurrent.filter(result => result.allowed).length, 5);
  assert.equal((await getAiQuotaStatus(day)).used, 5);

  const reservation = concurrent.find(result => result.allowed)?.reservation;
  assert.ok(reservation);
  await releaseAiQuota(reservation);
  assert.equal((await getAiQuotaStatus(day)).used, 4);
  await releaseAiQuota(reservation);
  await releaseAiQuota(reservation);
  await releaseAiQuota(reservation);
  await releaseAiQuota(reservation);
  await releaseAiQuota(reservation);
  assert.equal((await getAiQuotaStatus(day)).used, 0);

  const added = await addAiQuota(3, day);
  assert.equal(added.limit, 8);
  assert.equal(added.remaining, 8);
  const reset = await resetAiQuota(day);
  assert.equal(reset.limit, 5);
  assert.equal(reset.used, 0);

  await consumeAiQuota(new Date('2026-10-28T15:59:59.000Z'));
  const beforeMidnight = await getAiQuotaStatus(new Date('2026-10-28T15:59:59.000Z'));
  assert.equal(beforeMidnight.used, 1);
  const nextDay = await getAiQuotaStatus(new Date('2026-10-28T16:00:00.000Z'));
  assert.equal(nextDay.used, 0);
  assert.notEqual(nextDay.resetAt, beforeMidnight.resetAt);

  const brokenDirectory = await useStore(5);
  await writeFile(path.join(brokenDirectory, 'quota.json'), '{broken', 'utf8');
  await assert.rejects(() => getAiQuotaStatus(day), /额度记录不是有效 JSON/);

  console.log('AI 每日额度回归通过：上限、并发、退还、增加、重置、跨日与超额不调用上游。');
}

run()
  .finally(async () => {
    await Promise.all(temporaryDirectories.map(directory => rm(directory, { recursive: true, force: true })));
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
