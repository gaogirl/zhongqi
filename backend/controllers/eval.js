const axios = require('axios');

// 评估翻译质量（调用智谱大模型，返回结构化分数与建议）
// POST /api/eval/translation
// body: { direction: 'zh-en'|'en-zh', sourceText: string, studentText: string, refText?: string, model?: string }
exports.evaluateTranslation = async (req, res) => {
  try {
    const { direction = 'zh-en', sourceText = '', studentText = '', refText = '', model } = req.body || {};
    if (!sourceText.trim() || !studentText.trim()) {
      return res.status(400).json({ error: 'sourceText 与 studentText 为必填' });
    }

    const sys = `你是一名严格的翻译质量评估专家。请只返回一个纯 JSON 对象，不要使用 markdown 代码块，直接返回 JSON。字段如下：
{
  "overall": number (0-100 综合评分),
  "accuracy": number (0-100 准确性),
  "fidelity": number (0-100 忠实度),
  "fluency": number (0-100 流畅度),
  "grammar": number (0-100 语法),
  "suggestions": string (用中文分条给出可操作的改进建议，每条以"• "开头)
}`;

    const prompt = [
      `评估方向: ${direction}`,
      `原文:\n${sourceText}`,
      `学生译文:\n${studentText}`,
      refText ? `参考译文:\n${refText}` : '',
      `请从准确度/忠实度/流畅度/语法四方面打分，并给出中文建议（分条，简洁可执行）。直接返回 JSON，不要用代码块包裹。`
    ].filter(Boolean).join('\n\n');

    const resp = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: model || 'glm-4-flash',
        stream: false,
        temperature: 0.3,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    const text = resp.data?.choices?.[0]?.message?.content || '{}';
    
    // 清理可能的 markdown 代码块标记
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      // 移除开头的 ```json 或 ```
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '');
      // 移除结尾的 ```
      cleanText = cleanText.replace(/```\s*$/i, '');
    }
    
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      // 如果还是解析失败，尝试提取 JSON 部分
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = { 
            overall: 60, 
            accuracy: 60, 
            fidelity: 60, 
            fluency: 60, 
            grammar: 60, 
            suggestions: cleanText 
          };
        }
      } else {
        parsed = { 
          overall: 60, 
          accuracy: 60, 
          fidelity: 60, 
          fluency: 60, 
          grammar: 60, 
          suggestions: cleanText 
        };
      }
    }
    
    // 确保所有字段都有默认值
    const result = {
      overall: parsed.overall ?? 60,
      accuracy: parsed.accuracy ?? 60,
      fidelity: parsed.fidelity ?? 60,
      fluency: parsed.fluency ?? 60,
      grammar: parsed.grammar ?? 60,
      suggestions: parsed.suggestions || '暂无建议'
    };
    
    return res.json({ result });
  } catch (e) {
    console.error('evaluateTranslation error', e.response?.data || e.message);
    return res.status(500).json({ error: '评估失败，请稍后重试', detail: e.response?.data || e.message });
  }
};
