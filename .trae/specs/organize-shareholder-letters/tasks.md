# Tasks

## 阶段一：文件现状调查

- [x] Task 1: 调查股东信文件现状
  - [x] SubTask 1.1: 列出 content/letters/ 所有文件
  - [x] SubTask 1.2: 统计各年份文件数量
  - [x] SubTask 1.3: 识别重复文件

- [x] Task 2: 调查合伙人信文件现状
  - [x] SubTask 2.1: 列出 content/partnership/ 所有文件（如存在）
  - [x] SubTask 2.2: 统计各年份文件数量
  - [x] SubTask 2.3: 识别重复文件

## 阶段二：文件整理

- [x] Task 3: 清理股东信重复文件
  - [x] SubTask 3.1: 编写脚本识别重复年份
  - [x] SubTask 3.2: 选择最完整版本保留
  - [x] SubTask 3.3: 删除重复文件
  - [x] SubTask 3.4: 按年份排序文件

- [x] Task 4: 整理合伙人信文件
  - [x] SubTask 4.1: 检查是否存在合伙人信目录
  - [x] SubTask 4.2: 如存在，进行相同整理流程
  - [x] SubTask 4.3: 确保与股东信分离存放

## 阶段三：内容排版规范化

- [x] Task 5: 制定排版规范
  - [x] SubTask 5.1: 确定段落分隔规则
  - [x] SubTask 5.2: 确定行间距设置
  - [x] SubTask 5.3: 确定字号和字体

- [x] Task 6: 批量处理文本格式
  - [x] SubTask 6.1: 编写格式化脚本
  - [x] SubTask 6.2: 处理股东信内容
  - [x] SubTask 6.3: 处理合伙人信内容
  - [x] SubTask 6.4: 确保两端对齐

## 阶段四：知识图谱完善

- [x] Task 7: 增强实体提取
  - [x] SubTask 7.1: 提取人物实体
  - [x] SubTask 7.2: 提取公司实体
  - [x] SubTask 7.3: 提取概念实体

- [x] Task 8: 建立实体关系
  - [x] SubTask 8.1: 识别实体间关系
  - [x] SubTask 8.2: 更新知识图谱索引
  - [x] SubTask 8.3: 验证关系准确性

## 阶段五：验证与文档

- [x] Task 9: 验证整理结果
  - [x] SubTask 9.1: 验证无重复文件
  - [x] SubTask 9.2: 验证排序正确
  - [x] SubTask 9.3: 验证排版一致
  - [x] SubTask 9.4: 验证知识图谱完整

## Task Dependencies
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2
- Task 5 依赖 Task 3, 4
- Task 6 依赖 Task 5
- Task 7, 8 可并行进行
- Task 9 依赖 Task 3, 4, 6, 7, 8
