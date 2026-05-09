/**
 * 初始化示例数据 API - 美观版
 * POST /api/init-sample-data
 * 注意：这个端点应在生产环境中删除或保护
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const mongoose = require('mongoose');

const Term = require('../../models/Term');
const Case = require('../../models/Case');
const Question = require('../../models/Question');

// 生成渐变色彩
const gradients = [
  { from: '#667eea', to: '#764ba2' },
  { from: '#f093fb', to: '#f5576c' },
  { from: '#4facfe', to: '#00f2fe' },
  { from: '#43e97b', to: '#38f9d7' },
  { from: '#fa709a', to: '#fee140' },
  { from: '#30cfd0', to: '#330867' },
  { from: '#a8edea', to: '#fed6e3' },
  { from: '#ff9a9e', to: '#fecfef' },
];

const getRandomGradient = () => gradients[Math.floor(Math.random() * gradients.length)];
const dummyUserId = new mongoose.Types.ObjectId();

// 示例术语数据
const sampleTerms = [
  { term: 'Neural Machine Translation', meaning: '神经机器翻译（NMT）是一种使用人工神经网络来预测单词序列可能性的机器翻译方法。它使用编码器-解码器架构，能够捕捉长距离依赖关系，产生更流畅自然的翻译结果。', cat: '翻译技术', gradient: getRandomGradient(), icon: '🤖', difficulty: 'advanced' },
  { term: 'Corpus', meaning: '语料库（Corpus）是存储在计算机中的大量语言材料集合，用于语言研究、词典编纂和机器翻译训练。语料库可以是单语的、双语的或多语的。', cat: '语言学基础', gradient: getRandomGradient(), icon: '📚', difficulty: 'beginner' },
  { term: 'Translation Memory', meaning: '翻译记忆（TM）是一种用于存储源文本及其对应译文的语言数据库。当遇到相似或相同的句子时，系统会自动提示之前的翻译，提高翻译效率和一致性。', cat: '翻译工具', gradient: getRandomGradient(), icon: '💾', difficulty: 'intermediate' },
  { term: 'Back-translation', meaning: '回译是将译文重新翻译回源语言的过程，用于检验翻译质量。通过比较原文和回译文，可以发现翻译中的偏差和错误。', cat: '翻译方法', gradient: getRandomGradient(), icon: '🔄', difficulty: 'intermediate' },
  { term: 'Localization', meaning: '本地化（Localization）是使产品或服务适应特定地区或市场的过程，不仅包括语言翻译，还涉及文化、习俗、法律等方面的调整。', cat: '翻译实践', gradient: getRandomGradient(), icon: '🌍', difficulty: 'intermediate' },
  { term: 'CAT Tools', meaning: '计算机辅助翻译工具（Computer-Assisted Translation Tools）是帮助译者提高效率的软件，包括翻译记忆、术语管理、质量保证等功能。常见工具有 SDL Trados、MemoQ 等。', cat: '翻译工具', gradient: getRandomGradient(), icon: '🛠️', difficulty: 'beginner' },
  { term: 'Terminology Management', meaning: '术语管理是对专业术语进行系统化收集、整理、存储和维护的过程。良好的术语管理确保翻译的一致性和准确性。', cat: '翻译实践', gradient: getRandomGradient(), icon: '📖', difficulty: 'intermediate' },
  { term: 'Post-editing', meaning: '译后编辑是对机器翻译输出进行人工修改和润色的过程。根据编辑深度，可分为轻译后编辑和完全译后编辑。', cat: '翻译技术', gradient: getRandomGradient(), icon: '✏️', difficulty: 'advanced' },
  { term: 'Interpreting', meaning: '口译是一种口头翻译活动，译员在演讲者讲话的同时或之后将其内容翻译成目标语言。主要分为同声传译和交替传译。', cat: '口译', gradient: getRandomGradient(), icon: '🎤', difficulty: 'advanced' },
  { term: 'Subtitling', meaning: '字幕翻译是将影视作品的对话翻译成目标语言并以文字形式显示在屏幕上的过程。需要考虑时间限制、字数限制和文化差异。', cat: '视听翻译', gradient: getRandomGradient(), icon: '🎬', difficulty: 'intermediate' },
  { term: 'Transcreation', meaning: '创译（Transcreation）是在保持原文意图、风格和情感的基础上，对内容进行创造性改编，使其更符合目标文化的表达习惯。', cat: '翻译方法', gradient: getRandomGradient(), icon: '💡', difficulty: 'advanced' },
  { term: 'Quality Assurance', meaning: '质量保证（QA）是确保翻译产品符合预定标准的系统化活动，包括拼写检查、术语一致性检查、格式检查等。', cat: '翻译实践', gradient: getRandomGradient(), icon: '✅', difficulty: 'intermediate' },
];

// 示例案例数据
const sampleCases = [
  {
    title: 'AI 辅助翻译在科技文献翻译中的应用',
    domain: '科技翻译',
    summary: '探讨了如何利用 AI 翻译工具提高科技文献翻译效率，同时保持专业术语的准确性。',
    content: `## 案例背景
某科技公司需要将大量技术文档从英文翻译成中文，涉及人工智能、云计算、大数据等领域。

## 面临的挑战
1. **专业术语繁多**：每个领域都有大量专业术语需要准确翻译
2. **翻译量大**：需要在短时间内完成数十万字的翻译
3. **质量要求高**：技术文档的准确性直接影响产品使用

## 解决方案
### 1. 术语库建设
- 收集整理各领域核心术语
- 建立术语对照表
- 导入 CAT 工具统一管理

### 2. AI 辅助翻译流程
- 使用 NMT 进行初译
- 专业译者进行译后编辑
- QA 工具进行质量检查

### 3. 人机协作模式
- AI 处理重复性内容
- 人工处理创意性表达
- 专家审核关键内容

## 实施效果
- 翻译效率提升 **60%**
- 术语一致性达到 **98%**
- 整体翻译成本降低 **40%**

## 经验总结
1. AI 翻译适合处理结构化、重复性内容
2. 专业术语库是保证质量的关键
3. 人机协作是最高效的翻译模式`,
    tags: ['AI翻译', '科技文献', '术语管理', '译后编辑'],
    coverImage: '📊',
    difficulty: 'intermediate',
    estimatedTime: '45分钟',
    gradient: getRandomGradient(),
    createdBy: dummyUserId
  },
  {
    title: '跨境电商产品描述的本地化翻译',
    domain: '商务翻译',
    summary: '分析了跨境电商产品描述翻译中的文化适应问题，提供了本地化翻译的最佳实践。',
    content: `## 案例背景
某跨境电商平台需要将产品描述翻译成多国语言，以拓展海外市场。

## 核心问题
### 文化差异
- 颜色在不同文化中的含义不同
- 数字的吉凶含义差异
- 节日和习俗的表达方式

### 语言习惯
- 英文偏好简洁直接
- 日文注重礼貌和细节
- 德文喜欢严谨完整

## 本地化策略
### 1. 市场调研
- 了解目标市场文化特点
- 分析竞争对手的本地化策略
- 收集当地消费者反馈

### 2. 内容调整
- 调整产品卖点描述
- 适配当地计量单位
- 使用当地消费者熟悉的表达方式

### 3. 视觉元素
- 调整图片中的文字
- 适配当地审美偏好
- 考虑宗教和文化禁忌

## 成功案例
### 案例一：红色在中国 vs 西方
- 中国：喜庆、吉祥
- 西方：危险、警告
- **解决方案**：根据市场调整主色调描述

### 案例二：尺码标注
- 美国：S/M/L
- 日本：数字尺码
- **解决方案**：提供多单位对照表

## 效果评估
- 海外用户转化率提升 **35%**
- 退货率降低 **20%**
- 客户满意度提升 **45%**`,
    tags: ['跨境电商', '本地化', '文化适应', '产品描述'],
    coverImage: '🛒',
    difficulty: 'beginner',
    estimatedTime: '30分钟',
    gradient: getRandomGradient(),
    createdBy: dummyUserId
  },
  {
    title: '国际会议同声传译的质量保障',
    domain: '口译',
    summary: '介绍了国际会议同声传译的工作流程和质量保障措施，包括译前准备、团队协作和应急处理。',
    content: `## 案例背景
某国际组织举办为期三天的多边会议，需要中英双语同声传译服务。

## 译前准备
### 1. 资料收集
- 会议议程和背景资料
- 发言人简历和演讲稿
- 相关专业术语表
- 往期会议记录

### 2. 团队组建
- 主译员（资深）
- 副译员（轮换）
- 技术支持
- 术语专员

### 3. 设备调试
- 同声传译设备测试
- 备用设备准备
- 通讯系统检查

## 工作流程
### 轮换机制
- 每 20-30 分钟轮换一次
- 保证译员精力和翻译质量
- 交接时确保信息连贯

### 术语管理
- 实时更新术语表
- 团队共享关键术语
- 统一翻译标准

### 质量控制
- 双人互审机制
- 实时监听和反馈
- 录音存档备查

## 应急处理
### 突发情况应对
1. **技术故障**：立即启用备用设备
2. **术语疑难**：术语专员快速查询
3. **语速过快**：通过主持人协调
4. **内容敏感**：按预案处理

## 质量评估
### 评估维度
- 准确性：信息传达完整度
- 流畅性：语言表达自然度
- 及时性：翻译延迟控制
- 专业性：术语使用规范

### 客户反馈
- 整体满意度：**96%**
- 准确性评分：**98%**
- 推荐意愿：**100%**

## 经验总结
1. 充分的译前准备是成功的基础
2. 团队协作比个人能力更重要
3. 应急预案必须完善且可执行`,
    tags: ['同声传译', '国际会议', '质量控制', '团队协作'],
    coverImage: '🎙️',
    difficulty: 'advanced',
    estimatedTime: '60分钟',
    gradient: getRandomGradient(),
    createdBy: dummyUserId
  },
  {
    title: '游戏本地化：从翻译到创译',
    domain: '游戏本地化',
    summary: '探讨了游戏本地化中创译（Transcreation）的重要性，通过具体案例说明如何处理文化差异。',
    content: `## 案例背景
某国产 RPG 游戏需要出海到日本、欧美市场，需要进行深度本地化。

## 创译 vs 翻译
### 传统翻译
- 忠实原文
- 保持形式
- 语言转换

### 游戏创译
- 保留情感体验
- 适应文化背景
- 重新创作表达

## 关键挑战
### 1. 文化元素
**案例：武侠文化**
- 中国玩家理解"江湖"、"内力"
- 西方玩家需要更多背景解释
- **创译方案**：添加文化注释 + 类比说明

### 2. 幽默表达
**案例：网络梗**
- 中文梗难以直译
- 需要找到目标文化的对应表达
- **创译方案**：替换为当地流行梗

### 3. 角色塑造
**案例：角色名字**
- 中文名有特定含义
- 音译失去意义
- **创译方案**：意译 + 保留发音特点

## 实施流程
### 第一阶段：文化分析
- 识别文化特定内容
- 评估本地化难度
- 制定创译策略

### 第二阶段：内容创作
- 核心剧情创译
- 角色对话调整
- UI 文本优化

### 第三阶段：玩家测试
- 目标市场玩家测试
- 收集反馈
- 迭代优化

## 成功案例
### 案例：《原神》出海
- 保留中国文化特色
- 添加文化解释元素
- 获得全球玩家认可

### 数据表现
- 海外收入占比：**60%+**
- 玩家好评率：**95%**
- 文化接受度：**90%**

## 关键成功因素
1. **理解游戏核心体验**：不只是翻译文字
2. **尊重目标文化**：避免文化冲突
3. **保持创作一致性**：整体风格统一
4. **玩家参与反馈**：持续优化改进`,
    tags: ['游戏本地化', '创译', '文化差异', 'RPG'],
    coverImage: '🎮',
    difficulty: 'advanced',
    estimatedTime: '50分钟',
    gradient: getRandomGradient(),
    createdBy: dummyUserId
  },
  {
    title: '法律合同翻译的准确性保障',
    domain: '法律翻译',
    summary: '分析了法律合同翻译中的准确性要求，介绍了术语一致性、格式规范和质量检查的方法。',
    content: `## 案例背景
某跨国公司需要翻译一份复杂的商业合同，涉及中英文双语版本。

## 法律翻译特点
### 准确性要求
- 一字之差可能导致法律后果
- 术语必须精确对应
- 格式必须规范统一

### 语言特点
- 使用正式法律用语
- 句子结构复杂
- 条件从句繁多

## 翻译流程
### 1. 术语准备
**建立合同术语库**
- 收集标准法律术语
- 对照权威法律词典
- 咨询法律专家

**关键术语示例**
| 英文 | 中文 | 说明 |
|------|------|------|
| Hereinafter | 以下简称 | 合同常用语 |
| Party A/Party B | 甲方/乙方 | 合同主体 |
| Force Majeure | 不可抗力 | 免责条款 |
| Confidentiality | 保密义务 | 义务条款 |

### 2. 分段翻译
- 按条款分段处理
- 每段独立审核
- 保持条款间逻辑一致

### 3. 双语对照
- 制作双语对照表
- 确保条款一一对应
- 标注差异和说明

## 质量保证
### 三级审核
1. **译者自审**：检查术语和格式
2. **专家审核**：法律专家把关
3. **客户确认**：最终版本确认

### 检查清单
- [ ] 术语一致性检查
- [ ] 数字和日期核对
- [ ] 格式规范检查
- [ ] 逻辑完整性检查
- [ ] 法律合规性检查

## 常见陷阱
### 1. 一词多义
**案例："Shall" 的翻译**
- 表示义务："应当"
- 表示承诺："承诺"
- 表示权利："有权"

### 2. 文化差异
**案例：日期格式**
- 美国：MM/DD/YYYY
- 中国：YYYY年MM月DD日
- **解决方案**：统一使用 ISO 格式

### 3. 法律效力
- 确保译文具有法律效力
- 必要时添加解释性注释
- 明确以哪个版本为准

## 成果交付
### 交付物
1. 中文合同正式版
2. 术语对照表
3. 翻译说明文档
4. 质量保证报告

### 客户反馈
- 准确率：**99.8%**
- 满意度：**98%**
- 法律审查：一次通过`,
    tags: ['法律翻译', '合同翻译', '术语一致性', '质量保证'],
    coverImage: '⚖️',
    difficulty: 'advanced',
    estimatedTime: '55分钟',
    gradient: getRandomGradient(),
    createdBy: dummyUserId
  },
];

// 示例题目数据
const sampleQuestions = [
  // ===== 简单选择题 =====
  {
    type: 'choice',
    difficulty: 'easy',
    question: '「apple」的中文意思是？',
    options: [
      { label: 'A', text: '香蕉' },
      { label: 'B', text: '苹果' },
      { label: 'C', text: '橙子' },
      { label: 'D', text: '葡萄' }
    ],
    answer: 'B',
    explanation: 'apple 是苹果的英文表达，是最基础的水果词汇之一。',
    tags: ['基础词汇', '水果']
  },
  {
    type: 'choice',
    difficulty: 'easy',
    question: '「图书馆」的英文翻译是？',
    options: [
      { label: 'A', text: 'bookstore' },
      { label: 'B', text: 'library' },
      { label: 'C', text: 'museum' },
      { label: 'D', text: 'school' }
    ],
    answer: 'B',
    explanation: 'library 是图书馆的意思，bookstore 是书店，museum 是博物馆，school 是学校。',
    tags: ['基础词汇', '场所']
  },
  {
    type: 'choice',
    difficulty: 'easy',
    question: '「I am a student.」的正确翻译是？',
    options: [
      { label: 'A', text: '我是一名老师。' },
      { label: 'B', text: '我是一名学生。' },
      { label: 'C', text: '我是一名医生。' },
      { label: 'D', text: '我是一名工人。' }
    ],
    answer: 'B',
    explanation: 'student 意为学生，teacher 是老师，doctor 是医生，worker 是工人。',
    tags: ['基础句型', '职业']
  },
  {
    type: 'choice',
    difficulty: 'easy',
    question: '「谢谢」的英文表达是？',
    options: [
      { label: 'A', text: 'Sorry' },
      { label: 'B', text: 'Hello' },
      { label: 'C', text: 'Thank you' },
      { label: 'D', text: 'Goodbye' }
    ],
    answer: 'C',
    explanation: 'Thank you 是谢谢的标准表达，Sorry 是对不起，Hello 是你好，Goodbye 是再见。',
    tags: ['日常用语', '礼貌用语']
  },
  {
    type: 'choice',
    difficulty: 'easy',
    question: '「今天天气很好」的英文翻译是？',
    options: [
      { label: 'A', text: 'The weather is bad today.' },
      { label: 'B', text: 'The weather is good today.' },
      { label: 'C', text: 'Today is Monday.' },
      { label: 'D', text: 'I like today.' }
    ],
    answer: 'B',
    explanation: 'weather 意为天气，good 意为好，bad 意为坏。正确翻译应表达"今天天气很好"。',
    tags: ['日常表达', '天气']
  },
  
  // ===== 中等选择题 =====
  {
    type: 'choice',
    difficulty: 'medium',
    question: '「The book on the table is mine.」中划线部分的语法功能是？',
    options: [
      { label: 'A', text: '主语' },
      { label: 'B', text: '宾语' },
      { label: 'C', text: '定语' },
      { label: 'D', text: '状语' }
    ],
    answer: 'C',
    explanation: '"on the table" 是介词短语作后置定语，修饰名词 book，表示"桌子上的书"。',
    tags: ['语法', '定语', '介词短语']
  },
  {
    type: 'choice',
    difficulty: 'medium',
    question: '「他昨天没有去学校，因为他生病了。」的最佳英文翻译是？',
    options: [
      { label: 'A', text: 'He didn\'t go to school yesterday because he is sick.' },
      { label: 'B', text: 'He didn\'t go to school yesterday because he was sick.' },
      { label: 'C', text: 'He doesn\'t go to school yesterday because he was sick.' },
      { label: 'D', text: 'He not go to school yesterday because he sick.' }
    ],
    answer: 'B',
    explanation: '过去发生的事情应用过去时态，"didn\'t go" 是正确否定形式，"was sick" 与 yesterday 时间一致。',
    tags: ['时态', '翻译技巧', '过去时']
  },
  {
    type: 'choice',
    difficulty: 'medium',
    question: '「Neural Machine Translation」的准确中文翻译是？',
    options: [
      { label: 'A', text: '神经语言翻译' },
      { label: 'B', text: '神经机器翻译' },
      { label: 'C', text: '神经网络翻译' },
      { label: 'D', text: '智能机器翻译' }
    ],
    answer: 'B',
    explanation: 'Neural Machine Translation (NMT) 标准译名为"神经机器翻译"，是一种使用人工神经网络的机器翻译方法。',
    tags: ['专业术语', '翻译技术']
  },
  {
    type: 'choice',
    difficulty: 'medium',
    question: '以下哪个翻译最符合「创译」(Transcreation) 的定义？',
    options: [
      { label: 'A', text: '逐字翻译原文内容' },
      { label: 'B', text: '使用机器翻译后人工校对' },
      { label: 'C', text: '在保持原文意图基础上进行创造性改编' },
      { label: 'D', text: '将原文翻译成多种语言' }
    ],
    answer: 'C',
    explanation: '创译(Transcreation)是在保持原文意图、风格和情感的基础上，对内容进行创造性改编，使其更符合目标文化的表达习惯。',
    tags: ['翻译理论', '创译', '本地化']
  },
  {
    type: 'choice',
    difficulty: 'medium',
    question: '「The company has been working on this project for three years.」的正确翻译是？',
    options: [
      { label: 'A', text: '公司在这个项目上工作了三年。' },
      { label: 'B', text: '公司一直在做这个项目三年了。' },
      { label: 'C', text: '这家公司从事这个项目已经三年了。' },
      { label: 'D', text: '公司完成了这个项目三年。' }
    ],
    answer: 'C',
    explanation: 'has been working 是现在完成进行时，表示从过去持续到现在的动作。翻译时需体现"一直在做"的含义，同时保持中文表达的自然流畅。',
    tags: ['时态', '完成进行时', '翻译技巧']
  },
  
  // ===== 困难选择题 =====
  {
    type: 'choice',
    difficulty: 'hard',
    question: '「信达雅」翻译标准最早由谁提出？',
    options: [
      { label: 'A', text: '林语堂' },
      { label: 'B', text: '严复' },
      { label: 'C', text: '鲁迅' },
      { label: 'D', text: '傅雷' }
    ],
    answer: 'B',
    explanation: '「信达雅」是严复在《天演论》译例言中提出的翻译标准：信(faithfulness)忠实原文，达(expressiveness)通顺流畅，雅(elegance)文辞典雅。',
    tags: ['翻译理论', '翻译史', '严复']
  },
  {
    type: 'choice',
    difficulty: 'hard',
    question: '「The translation was so literal that it lost the original\'s poetic beauty.」的最佳翻译是？',
    options: [
      { label: 'A', text: '翻译太字面了，失去了原文的诗歌美。' },
      { label: 'B', text: '译文过于直译，丧失了原作的诗意之美。' },
      { label: 'C', text: '这个翻译太直白，原文的诗意都没了。' },
      { label: 'D', text: '翻译太过忠实，导致原文的诗意荡然无存。' }
    ],
    answer: 'B',
    explanation: '翻译时应注意：1) literal 译为"直译"更专业；2) poetic beauty 译为"诗意之美"更具文学性；3) 整体表达应体现评论的学术性。',
    tags: ['文学翻译', '翻译批评', '高级表达']
  },
  {
    type: 'choice',
    difficulty: 'hard',
    question: '在法律合同翻译中，「Force Majeure」的标准中文译名是？',
    options: [
      { label: 'A', text: '强制力' },
      { label: 'B', text: '不可抗力' },
      { label: 'C', text: '意外事件' },
      { label: 'D', text: '天灾人祸' }
    ],
    answer: 'B',
    explanation: 'Force Majeure 是法律术语，标准译名为"不可抗力"，指不能预见、不能避免并不能克服的客观情况，是合同中的标准免责条款。',
    tags: ['法律翻译', '专业术语', '合同']
  },
  
  // ===== 简单填空题 =====
  {
    type: 'fill',
    difficulty: 'easy',
    question: '请将「Good morning」翻译成中文：',
    answer: '早上好',
    explanation: 'Good morning 是早晨问候语，标准翻译为"早上好"或"早安"。',
    tags: ['日常用语', '问候语']
  },
  {
    type: 'fill',
    difficulty: 'easy',
    question: '请将「我爱你」翻译成英文：',
    answer: 'I love you',
    explanation: '这是最基础的情感表达，I love you 是标准翻译。',
    tags: ['基础表达', '情感']
  },
  {
    type: 'fill',
    difficulty: 'easy',
    question: '请将「谢谢你的帮助」翻译成英文：',
    answer: 'Thank you for your help',
    explanation: 'Thank you for... 是表示感谢的常用句型，help 意为帮助。',
    tags: ['日常用语', '感谢']
  },
  {
    type: 'fill',
    difficulty: 'easy',
    question: '请将「How are you?」翻译成中文：',
    answer: '你好吗',
    explanation: 'How are you? 是英语中最常用的问候语，询问对方近况。',
    tags: ['日常用语', '问候语']
  },
  
  // ===== 中等填空题 =====
  {
    type: 'fill',
    difficulty: 'medium',
    question: '请将「Translation is an art that requires both linguistic competence and cultural sensitivity.」翻译成中文：',
    answer: '翻译是一门艺术，需要语言能力和文化敏感度。',
    explanation: 'linguistic competence 译为"语言能力"，cultural sensitivity 译为"文化敏感度"。翻译时注意保持学术性表达。',
    tags: ['翻译理论', '学术表达']
  },
  {
    type: 'fill',
    difficulty: 'medium',
    question: '请将「机器翻译正在改变翻译行业的工作方式」翻译成英文：',
    answer: 'Machine translation is changing the way the translation industry works.',
    explanation: '"正在改变"用现在进行时 is changing，"工作方式"译为 the way...works 或 working methods。',
    tags: ['翻译技术', '行业表达']
  },
  {
    type: 'fill',
    difficulty: 'medium',
    question: '请将「CAT工具可以显著提高翻译效率」翻译成英文：',
    answer: 'CAT tools can significantly improve translation efficiency.',
    explanation: 'CAT (Computer-Assisted Translation) 工具是翻译行业常用术语，significantly 表示"显著地"。',
    tags: ['翻译工具', '专业术语']
  },
  
  // ===== 困难填空题 =====
  {
    type: 'fill',
    difficulty: 'hard',
    question: '请将「The translator must be a master of two languages and cultures, serving as an invisible bridge between the source and target texts.」翻译成中文：',
    answer: '译者必须是两种语言和文化的精通者，充当源文本与目标文本之间无形的桥梁。',
    explanation: 'master 译为"精通者"，invisible bridge 译为"无形的桥梁"，source and target texts 是翻译学术语"源文本与目标文本"。',
    tags: ['翻译理论', '高级翻译', '学术表达']
  },
  {
    type: 'fill',
    difficulty: 'hard',
    question: '请将「译者的任务是忠实地传达原文的内容、风格和神韵，同时使译文符合目标语言的表达习惯。」翻译成英文：',
    answer: 'The translator\'s task is to faithfully convey the content, style and spirit of the original text while making the translation conform to the expression habits of the target language.',
    explanation: '"忠实地传达"译为 faithfully convey，"神韵"可译为 spirit 或 charm，"表达习惯"译为 expression habits 或 linguistic conventions。',
    tags: ['翻译理论', '高级表达', '翻译标准']
  }
];

router.post('/init-sample-data', protect, authorize('teacher'), async (req, res) => {
  try {
    // 清空现有数据
    await Term.deleteMany({});
    await Case.deleteMany({});
    await Question.deleteMany({});

    // 插入示例数据
    const terms = await Term.insertMany(sampleTerms);
    const cases = await Case.insertMany(sampleCases);
    
    // 插入题目数据，添加 createdBy 字段
    const questionsWithCreator = sampleQuestions.map(q => ({
      ...q,
      createdBy: req.user._id
    }));
    const questions = await Question.insertMany(questionsWithCreator);

    res.json({
      success: true,
      message: '✅ 示例数据初始化成功',
      data: {
        termsCreated: terms.length,
        casesCreated: cases.length,
        questionsCreated: questions.length
      }
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    res.status(500).json({ error: '初始化数据失败: ' + error.message });
  }
});

module.exports = router;
