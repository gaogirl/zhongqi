import React, { useState, useMemo } from 'react';
import { translateRequest } from '../../services/ai';
import evalAPI from '../../services/eval';
import './Student.css';

export default function StudentAIInterpret() {
  const [direction, setDirection] = useState('zh-en');
  const [model, setModel] = useState('glm-4-flash'); // 默认使用快速模型
  const [sourceText, setSourceText] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [aiTranslation, setAiTranslation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: 输入原文, 2: 翻译, 3: 查看结果

  const targetLang = useMemo(() => (direction === 'zh-en' ? 'en' : 'zh'), [direction]);

  // 获取分数颜色
  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // 清空所有内容
  const handleClear = () => {
    setSourceText('');
    setUserTranslation('');
    setAiTranslation('');
    setResult(null);
    setError('');
    setStep(1);
  };

  // 步骤1完成，进入步骤2
  const handleNextStep = () => {
    if (!sourceText.trim()) {
      setError('请输入原文');
      return;
    }
    setError('');
    setStep(2);
  };

  // 提交评估
  const handleSubmit = async () => {
    if (!userTranslation.trim()) {
      setError('请输入你的翻译');
      return;
    }
    
    setLoading(true);
    setAiLoading(true);
    setError('');
    setResult(null);
    setAiTranslation('');

    try {
      // 并行执行：AI翻译 + 评分
      const [transRes, evalRes] = await Promise.all([
        // AI翻译（使用封装好的 translateRequest，自动带 token）
        translateRequest(sourceText, { targetLanguage: targetLang, model, stream: false }),
        // 评分评估
        evalAPI.evaluateTranslation({
          direction,
          sourceText,
          studentText: userTranslation,
          refText: '',
          model
        }).then(r => r.data || r)
      ]);

      setAiTranslation(transRes.translation || '');
      setResult(evalRes.result || null);
      setStep(3);
    } catch (e) {
      setError(e?.message || '评估失败，请重试');
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  // 重新开始
  const handleRestart = () => {
    handleClear();
  };

  return (
    <div className="interpret-page">
      {/* 头部 */}
      <div className="interpret-header">
        <div className="header-left">
          <h1>🎯 翻译质量评估系统</h1>
          <p>输入原文 → 完成翻译 → AI智能评分</p>
        </div>
        <div className="header-right">
          <div className="direction-switch">
            <button 
              className={direction === 'zh-en' ? 'active' : ''}
              onClick={() => setDirection('zh-en')}
            >
              中 → 英
            </button>
            <button 
              className={direction === 'en-zh' ? 'active' : ''}
              onClick={() => setDirection('en-zh')}
            >
              英 → 中
            </button>
          </div>
          <div className="model-switch">
            <button 
              className={model === 'glm-4-flash' ? 'active' : ''}
              onClick={() => setModel('glm-4-flash')}
              title="快速响应，适合日常使用"
            >
              ⚡ 快速
            </button>
            <button 
              className={model === 'glm-4.5-flash' ? 'active' : ''}
              onClick={() => setModel('glm-4.5-flash')}
              title="更高质量，适合专业翻译"
            >
              🎯 精准
            </button>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="interpret-steps">
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-text">输入原文</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-text">完成翻译</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-text">查看评分</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="interpret-main">
        {/* 左侧：原文区 */}
        <div className="interpret-panel source-panel">
          <div className="panel-header">
            <span className="panel-icon">📝</span>
            <span className="panel-title">
              {direction === 'zh-en' ? '中文原文' : '英文原文'}
            </span>
            <span className="panel-count">{sourceText.length} 字</span>
          </div>
          <textarea
            className="panel-textarea"
            placeholder={direction === 'zh-en' 
              ? '请输入需要翻译的中文文本...' 
              : 'Please enter the English text to translate...'}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={step > 1}
          />
          {step === 1 && (
            <div className="panel-actions">
              <button className="btn-clear" onClick={handleClear}>
                清空
              </button>
              <button 
                className="btn-next" 
                onClick={handleNextStep}
                disabled={!sourceText.trim()}
              >
                下一步 →
              </button>
            </div>
          )}
        </div>

        {/* 中间：用户翻译区 */}
        <div className="interpret-panel user-panel">
          <div className="panel-header">
            <span className="panel-icon">✍️</span>
            <span className="panel-title">我的翻译</span>
            <span className="panel-count">{userTranslation.length} 字</span>
          </div>
          <textarea
            className="panel-textarea"
            placeholder={direction === 'zh-en' 
              ? 'Please translate into English...' 
              : '请翻译成中文...'}
            value={userTranslation}
            onChange={(e) => setUserTranslation(e.target.value)}
            disabled={step === 3}
          />
          {step === 2 && (
            <div className="panel-actions">
              <button className="btn-back" onClick={() => setStep(1)}>
                ← 上一步
              </button>
              <button 
                className="btn-submit" 
                onClick={handleSubmit}
                disabled={!userTranslation.trim() || loading}
              >
                {loading ? '评估中...' : '提交评估 🚀'}
              </button>
            </div>
          )}
        </div>

        {/* 右侧：AI翻译和评分区 */}
        <div className="interpret-panel result-panel">
          {/* AI翻译 */}
          <div className="result-section ai-translation">
            <div className="section-header">
              <span className="section-icon">🤖</span>
              <span className="section-title">AI参考译文</span>
              {aiLoading && <span className="loading-dot">生成中...</span>}
            </div>
            <div className="section-content">
              {aiTranslation || (
                <span className="placeholder">
                  {step < 3 ? '提交后将显示AI翻译结果' : '暂无翻译结果'}
                </span>
              )}
            </div>
          </div>

          {/* 评分结果 */}
          <div className="result-section score-section">
            <div className="section-header">
              <span className="section-icon">📊</span>
              <span className="section-title">评分结果</span>
            </div>
            
            {!result ? (
              <div className="score-empty">
                <div className="empty-icon">📈</div>
                <p>提交翻译后查看评分</p>
              </div>
            ) : (
              <div className="score-content">
                {/* 综合评分 */}
                <div className="overall-score">
                  <div 
                    className="score-ring"
                    style={{
                      background: `conic-gradient(${getScoreColor(result.overall)} ${result.overall * 3.6}deg, #f0f0f5 0deg)`
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-number" style={{ color: getScoreColor(result.overall) }}>
                        {result.overall}
                      </span>
                      <span className="score-label">综合评分</span>
                    </div>
                  </div>
                </div>

                {/* 分项评分 */}
                <div className="detail-scores">
                  {[
                    { key: 'accuracy', label: '准确性', icon: '🎯' },
                    { key: 'fidelity', label: '忠实度', icon: '📋' },
                    { key: 'fluency', label: '流畅度', icon: '💬' },
                    { key: 'grammar', label: '语法', icon: '📝' },
                  ].map(item => (
                    <div key={item.key} className="detail-item">
                      <div className="detail-header">
                        <span>{item.icon} {item.label}</span>
                        <span style={{ color: getScoreColor(result[item.key]), fontWeight: 700 }}>
                          {result[item.key]}
                        </span>
                      </div>
                      <div className="detail-bar">
                        <div 
                          className="detail-fill"
                          style={{ 
                            width: `${result[item.key]}%`,
                            background: getScoreColor(result[item.key])
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI建议 */}
                {result.suggestions && (
                  <div className="ai-suggestions">
                    <div className="suggestion-header">💡 AI建议</div>
                    <div className="suggestion-content">{result.suggestions}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 重新开始按钮 */}
          {step === 3 && (
            <div className="panel-actions">
              <button className="btn-restart" onClick={handleRestart}>
                🔄 重新开始
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="interpret-error">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
