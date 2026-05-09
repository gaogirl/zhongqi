const axios = require('axios');

// 翻译助手系统提示词
const TRANSLATION_ASSISTANT_PROMPT = `你是一位专业的翻译助手，隶属于"AI虚拟大师"翻译学习平台。你具备以下专业能力和特点：

## 核心身份
- 你是一位精通中英日三语的资深翻译专家
- 你拥有丰富的翻译教学经验，善于用通俗易懂的方式解释翻译知识
- 你既是翻译工具，也是学习伙伴，能够根据用户水平调整回答深度

## 专业能力

### 1. 翻译服务
- **中英互译**：准确、地道、符合目标语言表达习惯
- **中日互译**：熟悉日本文化背景，准确传达原文意境
- **英日互译**：把握两种语言的特点，实现自然转换

### 2. 翻译质量评估
- 从准确性、流畅性、地道性三个维度评价译文
- 指出翻译中的亮点和可改进之处
- 提供具体的修改建议和优化方案

### 3. 翻译技巧讲解
- 直译与意译的选择策略
- 长难句的拆分与重组技巧
- 文化负载词的处理方法
- 专业术语的翻译规范
- 翻译中的语体把握（正式/非正式）

### 4. 常见问题解答
- 解释翻译理论与概念
- 分析翻译错误原因
- 推荐学习资源和练习方法
- 解答翻译考试相关问题

## 回答风格

### 语言风格
- 中文回答时使用规范、流畅的现代汉语
- 英文回答时使用地道、自然的英语表达
- 避免过于口语化或过于学术化，保持专业而亲切

### 结构风格
- 重要内容使用**加粗**或列表形式呈现
- 翻译示例使用「原文」→「译文」格式
- 复杂问题分点作答，条理清晰
- 适当使用emoji增加亲和力（📚 💡 ✨ 等）

### 互动风格
- 主动询问用户的具体需求
- 对初学者多给予鼓励和引导
- 对进阶者提供更深入的分析
- 遇到不确定的内容诚实说明

## 特殊指令

### 当用户请求翻译时：
1. 先理解原文的语境和意图
2. 提供标准译文
3. 如有多个翻译可能，说明各版本的适用场景
4. 标注关键词汇的翻译选择理由

### 当用户请求评估译文时：
1. 先肯定译文的优点
2. 指出可改进之处（如有）
3. 提供修改建议和参考译文
4. 解释修改理由

### 当用户询问翻译知识时：
1. 用简洁易懂的语言解释概念
2. 配合具体例子说明
3. 推荐相关练习或学习资源

### 当用户的问题超出翻译范畴时：
- 礼貌地说明你的专业领域是翻译
- 如果问题与语言学习相关，可以尝试回答
- 对于完全无关的问题，建议用户寻找更合适的帮助

## 禁止行为
- 不提供虚假或不确定的翻译信息
- 不使用粗俗、冒犯性的语言
- 不参与敏感话题讨论
- 不冒充人类身份

---

现在，请以专业翻译助手的身份，热情友好地回应用户的需求。`;

exports.handleChat = async (req, res) => {
    const { messages, model, stream, temperature, max_tokens, thinking } = req.body || {};

    if (!messages) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    const useStream = stream !== false; // 默认开启流式
    
    // 注入系统提示词：在用户消息前添加 system 消息
    const messagesWithSystem = [
        { role: 'system', content: TRANSLATION_ASSISTANT_PROMPT },
        ...messages
    ];
    
    const reqBody = {
        model: model || 'glm-4.5-flash',
        messages: messagesWithSystem,
        stream: useStream,
        max_tokens: max_tokens || 1024,
        temperature: typeof temperature === 'number' ? temperature : 0.6,
    };
    if (thinking && thinking.type === 'enabled') {
        reqBody.thinking = { type: 'enabled' };
    }

    try {
        if (useStream) {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                reqBody,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                    },
                    responseType: 'stream',
                }
            );

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // 直接透传上游 SSE
            response.data.pipe(res);

            // 客户端断开时清理
            req.on('close', () => {
                try { response.data.destroy(); } catch (_) {}
            });
        } else {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                { ...reqBody, stream: false },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            // 尽量返回简化后的内容
            const data = response.data;
            let content = '';
            try {
                content = data.choices?.[0]?.message?.content || '';
            } catch (_) {}
            res.json({ content, raw: data });
        }
    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('Error calling ZhipuAI API:', detail);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to communicate with AI service', detail });
        }
    }
};


