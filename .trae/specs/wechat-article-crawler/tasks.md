# 微信公众号历史文章抓取脚本 - 实现计划（分解与优先级任务列表）

## [x] Task 1: 项目脚手架与配置系统
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 初始化 Python 项目结构，建立目录布局（src/、config/、data/、logs/、tests/）
  - 实现配置管理模块，支持 YAML 配置文件 + 命令行参数 + 环境变量三层配置
  - 提供配置文件模板 config.example.yaml，包含所有可配置项及默认值
  - 关键配置项：目标公众号、存储路径、时间范围、频率参数、重试参数、代理、Cookie 等
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: 配置文件能被正确加载，所有字段有默认值
  - `programmatic` TR-1.2: 命令行参数可覆盖配置文件对应项
  - `programmatic` TR-1.3: 环境变量可注入敏感配置（如 COOKIE）
  - `human-judgement` TR-1.4: 配置模板文件注释清晰，用户可快速理解每项含义
- **Notes**: 使用 PyYAML + argparse + os.environ 实现三层配置；遵循 12-Factor 配置原则

## [x] Task 2: 数据模型与存储层
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 定义核心数据模型：Article（文章元数据）、ArticleContent（文章详情）、CrawlProgress（抓取进度）
  - 实现 JSON 存储：文章列表 JSON、单篇文章详情 JSON
  - 实现 CSV 导出：将文章元数据导出为 CSV 表格
  - 实现图片存储：按文章 ID 分目录保存图片，记录原始 URL 与本地路径映射
  - 实现增量索引：维护 last_crawled_at 时间戳和文章 ID 索引
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: JSON 输出文件格式合法，可被 json.load 正常解析
  - `programmatic` TR-2.2: CSV 文件用 pandas 读取无乱码，列数与字段定义一致
  - `programmatic` TR-2.3: 图片文件按 article_id 分目录存储，文件可正常打开
  - `programmatic` TR-2.4: 增量索引能正确记录上次抓取时间戳
- **Notes**: 使用 dataclass 或 pydantic 定义数据模型；存储路径支持自定义

## [x] Task 3: HTTP 请求封装与频率控制
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 封装 requests 会话，统一管理 headers、cookies、代理、超时
  - 实现频率控制器：支持最小/最大间隔、随机延迟、多级延迟（列表页/详情页/图片）
  - 实现三档预设：gentle（温和）、standard（标准）、fast（快速）
  - 设置合规的 User-Agent，包含项目标识和联系信息
  - 实现 robots.txt 检查逻辑
- **Acceptance Criteria Addressed**: AC-6, AC-10
- **Test Requirements**:
  - `programmatic` TR-3.1: 连续 10 次请求的间隔均在配置的 min/max 范围内
  - `programmatic` TR-3.2: gentle/standard/fast 三档预设参数正确且可切换
  - `programmatic` TR-3.3: User-Agent 字符串包含项目名称和版本号
  - `human-judgement` TR-3.4: robots.txt 检查逻辑合理，不爬取禁止路径
- **Notes**: 使用 time.sleep + random.uniform 实现随机延迟；频率控制器为单例

## [x] Task 4: 错误处理与重试机制
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 实现指数退避重试策略（exponential backoff）
  - 识别可重试错误：网络超时、连接错误、HTTP 429/500/502/503/504
  - 识别不可重试错误：HTTP 400/401/403/404
  - 重试次数和初始退避时间可配置
  - 达到最大重试次数后记录失败日志，继续下一个任务
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 模拟超时场景，重试次数不超过配置的 max_retries
  - `programmatic` TR-4.2: 指数退避时间递增（1s, 2s, 4s, ...）且不超过 max_backoff
  - `programmatic` TR-4.3: 404 等不可重试错误不触发重试
  - `programmatic` TR-4.4: 失败请求被记录到失败列表，不中断整体流程
- **Notes**: 可用 tenacity 库或自行实现重试装饰器

## [x] Task 5: 文章列表页抓取与分页遍历
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 4
- **Description**: 
  - 实现公众号历史消息列表页解析器，提取文章列表数据
  - 解析字段：标题、发布时间、文章链接、摘要、封面图 URL、文章标识
  - 实现分页遍历逻辑，自动翻页直到全部抓取完成
  - 实现去重逻辑（基于文章 URL 或 msgid）
  - 集成频率控制和重试机制
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 列表页 HTML 能正确解析出至少 10 篇文章的标题和链接
  - `programmatic` TR-5.2: 分页遍历能获取超过单页数量的文章（如 30+ 篇）
  - `programmatic` TR-5.3: 去重逻辑正确，结果中无重复文章 ID
  - `human-judgement` TR-5.4: 抓取的文章数量与公众号实际数量大致相符
- **Notes**: 列表页结构可能变化，解析器需模块化设计便于维护

## [x] Task 6: 文章详情页内容抓取
- **Priority**: high
- **Depends On**: Task 5
- **Description**: 
  - 实现文章详情页解析器，提取正文内容和元信息
  - 提取字段：正文 HTML/纯文本、作者、原创标识、分类标签、发布时间
  - 提取互动数据：阅读量、点赞数、在看数（如可获取）
  - 提取正文中所有图片 URL，并下载到本地
  - 图片下载使用独立的频率控制和重试
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-6.1: 详情页解析能获取非空的正文文本和作者信息
  - `programmatic` TR-6.2: 图片 URL 提取数量与页面实际图片数一致
  - `programmatic` TR-6.3: 图片下载成功率 ≥ 95%，损坏文件比例 < 1%
  - `human-judgement` TR-6.4: 正文文本内容与网页原文对比，段落结构基本一致
- **Notes**: 互动数据可能需要额外的 API 请求；图片下载用 stream 模式节省内存

## [x] Task 7: 增量更新与断点续抓
- **Priority**: medium
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 实现增量模式：对比上次抓取时间戳，仅抓取新增文章
  - 实现断点续抓：记录每篇文章的抓取状态（pending/success/failed）
  - 启动时读取进度文件，自动跳过已成功的文章
  - 支持按时间范围筛选（start_date / end_date）
  - 提供 --force 参数强制重新抓取
- **Acceptance Criteria Addressed**: AC-5, AC-9
- **Test Requirements**:
  - `programmatic` TR-7.1: 全量抓取后再次运行，增量模式不重复抓取已成功的文章
  - `programmatic` TR-7.2: 中断后重启，从上次失败/中断位置继续
  - `programmatic` TR-7.3: 时间范围筛选正确，仅抓取指定区间内的文章
  - `programmatic` TR-7.4: --force 参数可覆盖增量逻辑，强制全量重抓
- **Notes**: 进度文件使用 JSON 格式，原子写入避免损坏

## [x] Task 8: 日志系统与进度显示
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 实现结构化日志系统，支持 INFO/WARNING/ERROR 三级
  - 日志同时输出到控制台和文件（按日期轮转）
  - 实现实时进度条显示：总数 / 已完成 / 失败数 / 速度 / 预计剩余时间
  - 抓取完成后输出统计报告
  - 失败文章列表单独导出为 failed_articles.json
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-8.1: 日志文件按日期生成，格式包含时间、级别、消息
  - `programmatic` TR-8.2: 进度条能正确显示当前进度和速度
  - `programmatic` TR-8.3: 统计报告包含成功数、失败数、总耗时、平均速度
  - `human-judgement` TR-8.4: 控制台输出清晰易读，关键信息突出
- **Notes**: 使用 Python logging 模块；进度条可用 tqdm 库

## [x] Task 9: 命令行入口与主流程编排
- **Priority**: high
- **Depends On**: Task 2, Task 5, Task 6, Task 7, Task 8
- **Description**: 
  - 实现 CLI 入口脚本 main.py，支持 crawl/list/export/resume 等子命令
  - 编排完整抓取流程：配置加载 → 初始化 → 列表抓取 → 详情抓取 → 结果导出 → 统计报告
  - 实现优雅退出（Ctrl+C 保存进度后退出）
  - 编写 README 使用文档
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-5, AC-9
- **Test Requirements**:
  - `programmatic` TR-9.1: `python main.py crawl --config config.yaml` 能正常启动并执行完整流程
  - `programmatic` TR-9.2: Ctrl+C 中断后，进度文件被正确保存
  - `programmatic` TR-9.3: `resume` 子命令能从中断位置继续
  - `human-judgement` TR-9.4: README 文档包含安装、配置、使用示例、常见问题
- **Notes**: 使用 click 或 argparse 实现 CLI；主流程用状态机模式编排

## [x] Task 10: 测试与文档完善
- **Priority**: medium
- **Depends On**: Task 9
- **Description**: 
  - 为核心模块编写单元测试（配置、存储、频率控制、重试）
  - 编写集成测试脚本，验证端到端流程
  - 完善代码注释和 docstring
  - 编写合规声明和法律免责文档
  - 提供示例配置文件和使用演示
- **Acceptance Criteria Addressed**: AC-7, AC-10
- **Test Requirements**:
  - `programmatic` TR-10.1: 核心模块单元测试覆盖率 ≥ 70%
  - `programmatic` TR-10.2: 所有测试用例通过
  - `human-judgement` TR-10.3: 代码关键逻辑处有清晰注释
  - `human-judgement` TR-10.4: 合规声明显著且内容完整
- **Notes**: 使用 pytest 测试框架；合规声明置于 README 顶部和 LICENSE 文件中
