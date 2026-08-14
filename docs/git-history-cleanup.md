# Git 仓库历史瘦身与凭证清除（操作方案）

> ⚠️ 本方案会**重写全部提交哈希**，需要 `git push --force`，属于破坏性操作。
> 执行前请确认：无其他协作者正在基于当前历史工作；CI 使用 `main` 分支触发时不受影响（哈希变化无碍）。
> 建议先完整备份仓库（`git clone --mirror` 一份到本地/tmp），再执行。

## 背景

审计发现两个问题：

1. **`cookies.json` 曾入库**：内含真实 B 站会话凭证（SESSDATA / bili_jct / access_token / refresh_token）。
   当前 HEAD 已通过 `git rm --cached` + `.gitignore` 移除跟踪，但**历史 blob 仍然存在**，任何拿到仓库的人都能恢复出凭证。
2. **历史含大二进制文件**（合计约 1.6GB 仓库体积）：`public/audio/*.m4a`（最大 91MB）、33MB PDF、18.5MB tar.gz、13.9MB 的 markdown 历史版本等。

## 前置

```bash
# 安装 git-filter-repo（推荐方式，比 filter-branch 快且安全）
brew install git-filter-repo
# 或: pip install git-filter-repo
```

## 步骤

### 1. 备份

```bash
cd /path/to/repo-parent
git clone --mirror git@github.com:xiopoo/bamangBOOK.git bamangBOOK-backup.git
```

### 2. 清除 cookies.json 与历史大文件

在仓库根目录执行（filter-repo 要求从干净工作树开始，先 commit 当前改动）：

```bash
cd bamangBOOK
# 先提交当前的所有修复改动
git add -A && git commit -m "chore: 移除 cookies.json 凭证、清理死代码与死 CSS"

# 清除 cookies.json（所有历史版本）
git filter-repo --invert-paths --path cookies.json

# 清除历史中的大二进制 blob（保留当前内容目录中的 PDF 等正式资料除外，
# 如需保留某些文件，去掉对应 --path-glob 即可）
git filter-repo \
  --strip-blobs-bigger-than 10M \
  --path-glob 'public/audio/*' \
  --path-glob 'recovery_archive/*.tar.gz'
```

> 说明：`--strip-blobs-bigger-than 10M` 会删除所有超过 10MB 的 blob。
> 当前工作区中仍需要的文件（如 33MB 的巴菲特股东信 PDF、音频）需改为
> **不入 git**：移入 `public/`（音频已在 public/audio，已 gitignore）或改用
> Git LFS / 对象存储（COS/OSS）托管后从仓库移除。
> 若确定这些大文件在工作区仍需要，可先 `git rm` 并加入 `.gitignore`，再执行清理。

### 3. 重新关联远端并强制推送

filter-repo 会移除 origin 配置，需重新添加：

```bash
git remote add origin git@github.com:xiopoo/bamangBOOK.git
git push --force --all
git push --force --tags
```

### 4. 通知 B 站账号安全

cookies.json 中的 SESSDATA / token 曾进入 git 历史，无论仓库公开与否都应视为已泄露：

- 在 B 站「设置 → 账号安全」中注销所有会话 / 修改密码，使旧 token 全部失效。

### 5. 验证

```bash
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectsize)' | awk '$1=="blob" && $2>5000000' | wc -l
# 期望输出: 0（无 >5MB 的历史 blob）
du -sh .git
# 期望从 ~1.6G 降到几十 MB 量级
```

## 为什么不自动执行

历史重写 + 强制推送会改变远端仓库的 commit 历史，可能影响：
- 其他协作者/分支；
- 任何基于旧 commit SHA 的引用（CI 缓存、issue 链接、部署记录）。

因此仅提供方案，由你确认后手动执行（或告诉我"执行"，我按上述步骤完成）。
