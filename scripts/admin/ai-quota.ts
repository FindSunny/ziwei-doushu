import { loadEnvConfig } from '@next/env';

function printStatus(status: {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  contact: string;
}, storePath: string): void {
  const resetAt = new Date(status.resetAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  console.log(`今日已用：${status.used}`);
  console.log(`今日上限：${status.limit}`);
  console.log(`剩余次数：${status.remaining}`);
  console.log(`重置时间：${resetAt}`);
  console.log(`管理员联系方式：${status.contact}`);
  console.log(`额度文件：${storePath}`);
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { addAiQuota, getAiQuotaStatus, getAiQuotaStorePath, resetAiQuota } = await import('../../lib/ai-quota');
  const [command, value] = process.argv.slice(2);

  if (command === 'status' || !command) {
    printStatus(await getAiQuotaStatus(), getAiQuotaStorePath());
    return;
  }

  if (command === 'reset') {
    const status = await resetAiQuota();
    console.log('今日 AI 额度已重置。');
    printStatus(status, getAiQuotaStorePath());
    return;
  }

  if (command === 'add') {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('用法：npm run ai-quota -- add <正整数>');
    }
    const status = await addAiQuota(amount);
    console.log(`今日 AI 额度已增加 ${amount} 次。`);
    printStatus(status, getAiQuotaStorePath());
    return;
  }

  throw new Error('用法：npm run ai-quota -- <status|reset|add <正整数>>');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
