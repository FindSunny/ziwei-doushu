# AGENTS.md

## 项目说明

这是基于 Next.js App Router 的紫微斗数排盘与 AI 解读项目。排盘在浏览器本地完成；AI 解读由本机 Next.js 服务端调用 DeepSeek，不经过上游作者服务器。v4.0 解读数据集不是安装、启动、排盘或 AI 接口的运行依赖，不要为了常规开发默认下载。

## 运行环境

- 当前已验证环境为 Windows x64、Node.js `v24.14.1`、npm `11.11.0`。项目未声明 `engines`，改用其他 Node.js 大版本后必须重新执行类型检查、测试和构建。
- 当前通过 Node.js/npm 直接运行 Next.js，不依赖 Docker。Git 用于获取代码，Git Bash 只是 Windows 下的命令执行环境，不是应用运行依赖。
- 使用 `npm ci` 按 `package-lock.json` 安装项目依赖；Next.js、TypeScript、tsx 等均从项目依赖运行，不需要单独全局安装。
- 常规排盘与 AI 解读不需要 Python、CUDA、本地模型或 v4.0 数据集。AI 功能需要服务端配置 DeepSeek 环境变量，并能访问 `DEEPSEEK_BASE_URL`。

## 常用命令

```bash
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
npm run typecheck
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

启动生产服务前必须先执行 `npm run build`。启动任何服务前先检查 3000 端口；只能停止已核实属于本项目的旧进程。

局域网分享可使用 `--hostname 0.0.0.0`，但当前应用没有登录鉴权，其他使用者会消耗部署者的 DeepSeek 额度。不要在未明确授权时暴露到局域网或公网。

## 目录与职责

- `app/chart/page.tsx`：排盘工作台与 AI 解读面板布局。
- `app/heming/page.tsx`：双方合盘页面。
- `app/api/interpret/route.ts`：单人 AI 解读接口及输入校验。
- `app/api/heming/route.ts`：合盘 AI 接口及输入校验。
- `components/InsightPanel.tsx`：主题解读、主题缓存、追问、请求取消与加载状态。
- `components/AiContent.tsx`：统一 Markdown/GFM 渲染。
- `lib/deepseek.ts`：DeepSeek 服务端请求和上游 SSE 协议转换。
- `lib/ziwei/`：本地排盘算法、四化、格局、历法与类型定义。
- `scripts/regression/`：可由 `npm test` 执行的排盘回归测试。
- `tests/regression/`：用户可见功能的回归清单与手工或自动验证证据。

## 编码约定

- 使用 TypeScript、React 函数组件和 Next.js App Router，遵守现有 client/server 组件边界。
- 沿用现有 Tailwind、CSS 变量、中文界面文案和代码组织方式；改动保持聚焦，不顺手重构无关模块。
- 优先复用现有组件。AI 内容的 Markdown 渲染统一使用 `components/AiContent.tsx`，不要重新实现不一致的行解析器。
- Markdown 使用 `react-markdown` 与 `remark-gfm`。不要启用原始 HTML 渲染或引入未消毒的 `dangerouslySetInnerHTML`。
- 密钥只能存在于服务端环境变量中。不得把 `DEEPSEEK_API_KEY` 写入客户端代码、日志、截图、测试夹具或 `NEXT_PUBLIC_*` 变量。
- 不恢复 Vercel Analytics、Speed Insights 或其他统计上报，除非用户明确要求。

## 排盘规则

- `BirthInfo.hour` 是地支时辰索引 `0–11`，不是钟点 `0–23`。
- 晚子时 `23:00–23:59` 按次日排盘，时辰索引仍为 `0`；早子时按当日排盘。
- 修改历法、真太阳时、夏令时、立春、四柱、安星或四化逻辑前，先阅读现有实现及对应回归，不得仅凭单个样例推翻已有口径。
- 新修排盘规则必须添加针对边界的回归测试，并运行完整 `npm test`，不能只验证用户给出的单个命盘。
- 不得编造倪海厦原话、古籍引文或出处；解读不得包装成确定性预言。

## AI 与 SSE 约定

- 前端协议为 `data: {"delta":{"text":"..."}}`，结束事件为 `data: [DONE]`。
- SSE 读取必须保留跨网络 chunk 的不完整行缓冲，不能把每个 chunk 当作完整 JSON 行解析。
- 发送消息前过滤空白内容，只向后端传递约定字段；后端继续保留消息数量、角色、长度和命盘结构校验。
- DeepSeek 的 `reasoning_content` 不是正式回答；界面只展示 `delta.content`。没有正文时不得伪装成成功响应。
- 切换主题时取消旧请求，并用请求标识阻止旧流覆盖新主题。只有完成的主题结果才进入缓存；手动“重新生成”只刷新当前主题。
- 测试加载、取消、缓存和流式渲染时使用本地模拟 SSE。不要在常规回归中调用真实 DeepSeek、消耗额度或发送真实个人信息。

## 隐私与数据

- `.env.local` 必须保持被 Git 忽略；`.env.example` 只能包含占位符。
- 排盘不需要外部 AI 请求，但 AI 解读会向 DeepSeek 发送命盘和对话内容，可能包含姓名、出生时间、性别、出生地和敏感提问。
- 命盘历史保存在浏览器 `localStorage`。不要误以为云端解读或本地历史属于零隐私风险。
- 不在测试、文档、提交或截图中保留真实密钥和个人敏感信息；使用合成出生信息与模拟响应。

## 验证要求

根据改动范围执行：

1. `npm run typecheck`。
2. 排盘或共享逻辑改动运行 `npm test`。
3. 页面、接口或依赖改动运行 `npm run build`。
4. UI 改动在浏览器实际验证主要流程、长内容、加载状态和边缘情况；同时检查控制台与横向溢出。
5. AI 接口和流式 UI 使用本地模拟数据回归，明确记录是否产生外部调用。

未完成浏览器验证时，不得声称 UI 已完整验证。测试失败时先说明并修复根因，不要跳过测试或降低既有验收条件。

## Git 操作边界

- 提交前展示拟执行命令、文件范围和 commit message，获得用户明确确认后再提交。
- 推送、合并、打标签等操作需要用户另行明确授权；不要把一次授权延伸到后续操作。
- 优先将相关文件逐个或按明确目录加入暂存区，提交前检查 `git status`，确认没有 `.env.local`、密钥、构建产物或无关文件。
- 不使用强推、硬重置或跳过 hooks 的方式绕过问题。
