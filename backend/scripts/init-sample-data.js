/**
 * 初始化示例数据脚本 - 美观版
 * 运行方式: 在后端目录执行 node scripts/init-sample-data.js
 */

const mongoose = require('mongoose');
const Term = require('../models/Term');
const Case = require('../models/Case');

// 从环境变量或使用默认 MongoDB URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-virtual';

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

// 获取随机渐变
const getRandomGradient = () => gradients[Math.floor(Math.random() * gradients.length)];

// 示例术语数据 - 翻译专业相关
const sampleTerms = [
  {
    term: 'Neural Machine Translation',
    meaning: '神经机器翻译（NMT）是一种使用人工神经网络来预测单词序列可能性的机器翻译方法。它使用编码器-解码器架构，能够捕捉长距离依赖关系，产生更流畅自然的翻译结果。',
    cat: '翻译技术',
    gradient: getRandomGradient(),
    icon: '🤖',
    difficulty: 'advanced'
  },
  {
    term: 'Corpus',
    meaning: '语料库（Corpus）是存储在计算机中的大量语言材料集合，用于语言研究、词典编纂和机器翻译训练。语料库可以是单语的、双语的或多语的。',
    cat: '语言学基础',
    gradient: getRandomGradient(),
    icon: '📚',
    difficulty: 'beginner'
  },
  {
    term: 'Translation Memory',
    meaning: '翻译记忆（TM）是一种用于存储源文本及其对应译文的语言数据库。当遇到相似或相同的句子时，系统会自动提示之前的翻译，提高翻译效率和一致性。',
    cat: '翻译工具',
    gradient: getRandomGradient(),
    icon: '💾',
    difficulty: 'intermediate'
  },
  {
    term: 'Back-translation',
    meaning: '回译是将译文重新翻译回源语言的过程，用于检验翻译质量。通过比较原文和回译文，可以发现翻译中的偏差和错误。',
    cat: '翻译方法',
    gradient: getRandomGradient(),
    icon: '🔄',
    difficulty: 'intermediate'
  },
  {
    term: 'Localization',
    meaning: '本地化（Localization）是使产品或服务适应特定地区或市场的过程，不仅包括语言翻译，还涉及文化、习俗、法律等方面的调整。',
    cat: '翻译实践',
    gradient: getRandomGradient(),
    icon: '🌍',
    difficulty: 'intermediate'
  },
  {
    term: 'CAT Tools',
    meaning: '计算机辅助翻译工具（Computer-Assisted Translation Tools）是帮助译者提高效率的软件，包括翻译记忆、术语管理、质量保证等功能。常见工具有 SDL Trados、MemoQ 等。',
    cat: '翻译工具',
    gradient: getRandomGradient(),
    icon: '🛠️',
    difficulty: 'beginner'
  },
  {
    term: 'Terminology Management',
    meaning: '术语管理是对专业术语进行系统化收集、整理、存储和维护的过程。良好的术语管理确保翻译的一致性和准确性。',
    cat: '翻译实践',
    gradient: getRandomGradient(),
    icon: '📖',
    difficulty: 'intermediate'
  },
  {
    term: 'Post-editing',
    meaning: '译后编辑是对机器翻译输出进行人工修改和润色的过程。根据编辑深度，可分为轻译后编辑和完全译后编辑。',
    cat: '翻译技术',
    gradient: getRandomGradient(),
    icon: '✏️',
    difficulty: 'advanced'
  },
  {
    term: 'Interpreting',
    meaning: '口译是一种口头翻译活动，译员在演讲者讲话的同时或之后将其内容翻译成目标语言。主要分为同声传译和交替传译。',
    cat: '口译',
    gradient: getRandomGradient(),
    icon: '🎤',
    difficulty: 'advanced'
  },
  {
    term: 'Subtitling',
    meaning: '字幕翻译是将影视作品的对话翻译成目标语言并以文字形式显示在屏幕上的过程。需要考虑时间限制、字数限制和文化差异。',
    cat: '视听翻译',
    gradient: getRandomGradient(),
    icon: '🎬',
    difficulty: 'intermediate'
  },
  {
    term: 'Transcreation',
    meaning: '创译（Transcreation）是在保持原文意图、风格和情感的基础上，对内容进行创造性改编，使其更符合目标文化的表达习惯。',
    cat: '翻译方法',
    gradient: getRandomGradient(),
    icon: '💡',
    difficulty: 'advanced'
  },
  {
    term: 'Quality Assurance',
    meaning: '质量保证（QA）是确保翻译产品符合预定标准的系统化活动，包括拼写检查、术语一致性检查、格式检查等。',
    cat: '翻译实践',
    gradient: getRandomGradient(),
    icon: '✅',
    difficulty: 'intermediate'
  },
];

// 示例案例数据 - 翻译实践案例
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
    gradient: getRandomGradient()
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
    gradient: getRandomGradient()
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
    gradient: getRandomGradient()
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
    gradient: getRandomGradient()
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
    gradient: getRandomGradient()
  },
];

async function initSampleData() {
  try {
    console.log('🚀 正在连接数据库...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ 数据库连接成功');

    // 清空现有数据
    console.log('🗑️  清空现有数据...');
    await Term.deleteMany({});
    await Case.deleteMany({});

    // 插入示例术语
    const terms = await Term.insertMany(sampleTerms);
    console.log(`✅ 成功创建 ${terms.length} 个术语`);

    // 插入示例案例
    const cases = await Case.insertMany(sampleCases);
    console.log(`✅ 成功创建 ${cases.length} 个案例`);

    console.log('\n🎉 示例数据初始化完成！');
    console.log('📚 你现在可以在前端术语库和案例库页面看到美观的示例数据了。');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化数据时出错:', error.message);
    process.exit(1);
  }
}

initSampleData();
