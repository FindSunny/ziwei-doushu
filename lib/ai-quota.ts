import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_DAILY_LIMIT = 500;
const DEFAULT_CONTACT = '站点管理员';
const TIME_ZONE = 'Asia/Shanghai';
const CHINA_OFFSET_MS = 8 * 60 * 60 * 1000;

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

interface StoredQuota {
  date: string;
  used: number;
  extraLimit: number;
}

export interface AiQuotaReservation {
  date: string;
}

export interface AiQuotaStatus {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
  contact: string;
}

export type ConsumeAiQuotaResult =
  | { allowed: true; quota: AiQuotaStatus; reservation: AiQuotaReservation }
  | { allowed: false; quota: AiQuotaStatus; reservation: null };

let mutationQueue: Promise<unknown> = Promise.resolve();

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => undefined);
  return result;
}

function getBaseLimit(): number {
  const configured = Number.parseInt(process.env.AI_QUOTA_DAILY_LIMIT || '', 10);
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_DAILY_LIMIT;
}

function getContact(): string {
  return process.env.AI_QUOTA_CONTACT?.trim() || DEFAULT_CONTACT;
}

export function getAiQuotaStorePath(): string {
  const configured = process.env.AI_QUOTA_STORE?.trim();
  return configured
    ? path.resolve(configured)
    : path.join(process.cwd(), '.data', 'ai-quota.json');
}

function getDayWindow(now: Date): { date: string; resetAt: string } {
  const parts = dayFormatter.formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const date = `${values.year}-${values.month}-${values.day}`;
  // 中国大陆固定 UTC+8，无夏令时；下个自然日 00:00 对应前一日 UTC 16:00。
  const resetAt = new Date(Date.UTC(year, month - 1, day + 1) - CHINA_OFFSET_MS).toISOString();
  return { date, resetAt };
}

function normalizeStoredQuota(value: unknown): StoredQuota | null {
  if (!value || typeof value !== 'object') return null;
  const stored = value as { date?: unknown; used?: unknown; extraLimit?: unknown };
  if (typeof stored.date !== 'string'
    || !Number.isInteger(stored.used) || (stored.used as number) < 0
    || (stored.extraLimit !== undefined
      && (!Number.isInteger(stored.extraLimit) || (stored.extraLimit as number) < 0))) {
    return null;
  }
  return {
    date: stored.date,
    used: stored.used as number,
    extraLimit: (stored.extraLimit as number | undefined) ?? 0,
  };
}

function createEmptyState(date: string): StoredQuota {
  return { date, used: 0, extraLimit: 0 };
}

async function readStoredQuota(): Promise<StoredQuota | null> {
  const storePath = getAiQuotaStorePath();
  let content: string;
  try {
    content = await readFile(storePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('AI 额度记录不是有效 JSON');
  }
  const normalized = normalizeStoredQuota(parsed);
  if (!normalized) throw new Error('AI 额度记录格式错误');
  return normalized;
}

async function writeStoredQuota(state: StoredQuota): Promise<void> {
  const storePath = getAiQuotaStorePath();
  await mkdir(path.dirname(storePath), { recursive: true, mode: 0o750 });
  const temporaryPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(state)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryPath, storePath);
}

async function loadCurrentState(day: string): Promise<StoredQuota> {
  const stored = await readStoredQuota();
  return stored?.date === day ? stored : createEmptyState(day);
}

function buildStatus(state: StoredQuota, window: { date: string; resetAt: string }): AiQuotaStatus {
  const limit = getBaseLimit() + state.extraLimit;
  return {
    limit,
    used: state.used,
    remaining: Math.max(0, limit - state.used),
    resetAt: window.resetAt,
    contact: getContact(),
  };
}

export async function getAiQuotaStatus(now = new Date()): Promise<AiQuotaStatus> {
  return serialize(async () => {
    const window = getDayWindow(now);
    const state = await loadCurrentState(window.date);
    return buildStatus(state, window);
  });
}

export async function consumeAiQuota(now = new Date()): Promise<ConsumeAiQuotaResult> {
  return serialize(async () => {
    const window = getDayWindow(now);
    const state = await loadCurrentState(window.date);
    const status = buildStatus(state, window);
    if (status.remaining <= 0) {
      return { allowed: false, quota: status, reservation: null };
    }

    const updated = { ...state, used: state.used + 1 };
    await writeStoredQuota(updated);
    return {
      allowed: true,
      quota: buildStatus(updated, window),
      reservation: { date: window.date },
    };
  });
}

export async function releaseAiQuota(reservation: AiQuotaReservation): Promise<void> {
  await serialize(async () => {
    const stored = await readStoredQuota();
    if (!stored || stored.date !== reservation.date || stored.used <= 0) return;
    await writeStoredQuota({ ...stored, used: stored.used - 1 });
  });
}

export async function resetAiQuota(now = new Date()): Promise<AiQuotaStatus> {
  return serialize(async () => {
    const window = getDayWindow(now);
    const state = createEmptyState(window.date);
    await writeStoredQuota(state);
    return buildStatus(state, window);
  });
}

export async function addAiQuota(amount: number, now = new Date()): Promise<AiQuotaStatus> {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('增加额度必须是正整数');
  return serialize(async () => {
    const window = getDayWindow(now);
    const state = await loadCurrentState(window.date);
    const updated = { ...state, extraLimit: state.extraLimit + amount };
    await writeStoredQuota(updated);
    return buildStatus(updated, window);
  });
}
