# 部署与环境治理（E-01 / SEC-01 / L-01）

本文记录生产域名校验、凭据治理与日志级别控制的约定，配套代码见
`scripts/prebuild.js`、`scripts/scan-staged-secrets.mjs`、`src/lib/logger.ts`。

## 1. 生产域名（E-01）

`src/lib/site.ts` 在缺少生产 URL 时会回落 `http://localhost:3000`，
这会让 canonical / sitemap / robots.txt 在线上生成 localhost 地址，伤害 SEO。

**部署必须配置**（Vercel 项目环境变量或 .env.local）：

```text
NEXT_PUBLIC_SITE_URL=https://fulilab.com
NEXT_PUBLIC_SITE_DOMAIN=fulilab.com
```

- `scripts/prebuild.js` 在 `NODE_ENV=production` 或 Vercel 构建时校验：
  缺少 `NEXT_PUBLIC_SITE_URL` 且无 Vercel URL → 高亮报错并退出（exit 1）。
- 本地开发（`next dev` / 本地 `npm run build`）不受影响。
- `.env.example` 已包含上述说明。

## 2. 凭据治理（SEC-01）

**规则：真实凭据只放本机 `.env.local` 或部署平台环境变量，绝不提交进 git。**

- `.gitignore` 已覆盖 `.env.local` / `.env.*.local`（第 5-6 行）。
- `.env.example` 只保留空值和说明，不含真实值。

提交前运行 staged 凭据扫描：

```bash
npm run scan:secrets          # 检查 git staged 文件（提交前必跑）
npm run scan:secrets:all      # 全量扫描工作区（排查硬编码密钥）
```

扫描覆盖的模式：

- `IMA_API_KEY` / `IMA_CLIENT_SECRET`
- `WECHAT_APP_SECRET` / `STRIPE_SECRET` / `sk_live_*`
- `AWS_SECRET_ACCESS_KEY` / `AKIA*`
- `OPENAI_API_KEY` / `sk-*`
- `GITHUB_TOKEN` / `gh[pousr]_*`
- 通用 `API_KEY` / `API_SECRET` / `ACCESS_TOKEN` / `SECRET_KEY` / `PRIVATE_KEY`

如果 `.env.local` 曾被压缩、同步、截图或发给外部，**立即轮换相关凭据**。

## 3. 日志级别（L-01）

`src/lib/logger.ts` 支持级别控制：

- 默认：生产构建/生产运行只输出 `warn` / `error`；开发输出 `info`。
- 覆盖：环境变量 `NEXT_PUBLIC_LOG_LEVEL` 或 `LOG_LEVEL`，
  取值 `debug | info | warn | error | silent`。

```bash
LOG_LEVEL=info npm run build   # 打开详细日志定位构建问题
```

构建期对可预期的数据缺失（如 `content/index.json` 共现为空）只输出一次汇总 warning，
不再为每个页面/概念重复刷屏。
