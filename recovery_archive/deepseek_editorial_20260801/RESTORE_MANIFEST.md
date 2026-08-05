# DeepSeek 阶段恢复清单

## 恢复边界

- 巴菲特卷首次处理前快照：`2026-08-01 09:41:45`，文件名含 `deAI_beforeCH01`。
- 芒格卷首次处理前快照：`2026-08-01 14:55:03`，文件名含 `deAI_beforeALL`。
- `editorial/` 中晚于 `2026-08-01 09:41:44` 的活动文件已按原目录结构移入 `post_boundary_files/`。

## 可回滚档案

- `editorial_current_before_restore.tar.gz`：恢复前完整 `editorial/` 快照。
- SHA-256：`cdea72cf247602d07649c75e0295ae14cf21dd2a072a7db9be9304a786ad472d`
- 归档条目：440。
- 单独隔离的接管后文件：93。

## 恢复后的主稿基线

- 巴菲特卷锁定稿 SHA-256：`3c5e36c8625b361a0ad508d81e1cf9e2be95d0d28f870448374d297bc8bdab60`
- 芒格卷锁定稿 SHA-256：`e6b37b7d3798df35d4af6cfcad02fb8b358a401ee8676cb5a4c5d383fee14298`

以上两个哈希均与对应 `deAI_before...` 快照逐字节一致。
