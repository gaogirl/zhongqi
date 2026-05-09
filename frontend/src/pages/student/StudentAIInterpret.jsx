import React, { useMemo, useState } from 'react';
import { API_BASE } from '../../services/ai';
import evalAPI from '../../services/eval';
import './Student.css';

export default function StudentAIInterpret() {
  const [direction, setDirection] = useState('zh-en');
  const [src, setSrc] = useState('');
  const [refText, setRefText] = useState('');
  const [myText, setMyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const targetLang = useMemo(() => (direction === 'zh-en' ? 'en' : 'zh'), [direction]);

  const genReference = async () => {
    if (!src.trim()) return;
    setErr('');
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: src, targetLang, stream: false, model: 'glm-4.5' })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setRefText(data.translation || '');
    } catch (e) {
      setErr(e?.message || '生成参考译文失败');
    } finally { setLoading(false); }
  };

  const clearAll = () => {
    setSrc(''); setRefText(''); setMyText(''); setResult(null); setErr('');
  };

  const onEvaluate = async () => {
    if (!src.trim() || !myText.trim()) { setErr('请先输入原文与译文'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const resp = await evalAPI.evaluateTranslation({ direction, sourceText: src, studentText: myText, refText });
      const data = resp.data || resp;
      setResult(data.result || null);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '评估失败');
    } finally { setLoading(false); }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="eval-page">
      {/* 头部 */}
      <div className="eval-header">
        <div className="eval-header-content">
          <h1>🎯 翻译质量评估系统</h1>
          <p>基于 AI 的智能翻译评估工具，多维度分析译文质量</p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="eval-steps">
        <div className={`eval-step ${src ? 'completed' : 'active'}`}>
          <span className="step-num">1</span>
          <span className="step-text">输入原文</span>
        </div>
        <div className="step-line"></div>
        <div className={`eval-step ${myText ? 'completed' : src ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-text">提交译文</span>
        </div>
        <div className="step-line"></div>
        <div className={`eval-step ${result ? 'completed' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-text">查看评估</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="eval-main">
        {/* 左侧：输入区 */}
        <div className="eval-input-section">
          {/* 翻译方向 */}
          <div className="eval-direction">
            <button 
              className={`dir-btn ${direction === 'zh-en' ? 'active' : ''}`}
              onClick={() => setDirection('zh-en')}
            >
              <span className="dir-arrow">中文</span>
              <span className="dir-icon">→</span>
              <span className="dir-arrow">英文</span>
            </button>
            <button 
              className={`dir-btn ${direction === 'en-zh' ? 'active' : ''}`}
              onClick={() => setDirection('en-zh')}
            >
              <span className="dir-arrow">英文</span>
              <span className="dir-icon">→</span>
              <span className="dir-arrow">中文</span>
            </button>
          </div>

          {/* 原文输入 */}
          <div className="eval-textarea-wrap">
            <label>📝 原文</label>
            <textarea 
              placeholder="请输入需要翻译的原文..." 
              value={src} 
              onChange={e => setSrc(e.target.value)}
              rows={4}
            />
            <div className="textarea-footer">
              <span className="char-count">{src.length} 字</span>
            </div>
          </div>

          {/* 译文输入 */}
          <div className="eval-textarea-wrap">
            <label>✍️ 我的译文</label>
            <textarea 
              placeholder="请输入你的翻译..." 
              value={myText} 
              onChange={e => setMyText(e.target.value)}
              rows={4}
            />
            <div className="textarea-footer">
              <span className="char-count">{myText.length} 字</span>
            </div>
          </div>

          {/* 参考译文 */}
          <div className="eval-textarea-wrap reference">
            <label>📖 参考译文 <span className="label-note">(AI生成)</span></label>
            <textarea 
              placeholder="点击「生成参考译文」按钮..." 
              value={refText} 
              onChange={e => setRefText(e.target.value)}
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          <div className="eval-actions">
            <button className="btn-secondary" onClick={genReference} disabled={loading || !src}>
              {loading ? '⏳ 生成中...' : '🔄 生成参考译文'}
            </button>
            <button className="btn-primary" onClick={onEvaluate} disabled={loading || !src || !myText}>
              {loading ? '⏳ 评估中...' : '🚀 开始评估'}
            </button>
            <button className="btn-ghost" onClick={clearAll}>
              🗑️ 清空
            </button>
          </div>

          {err && <div className="eval-error">❌ {err}</div>}
        </div>

        {/* 右侧：结果区 */}
        <div className="eval-result-section">
          {!result ? (
            <div className="eval-empty">
              <div className="empty-icon">📊</div>
              <h3>评估结果</h3>
              <p>输入原文和译文后，点击「开始评估」查看分析结果</p>
            </div>
          ) : (
            <>
              {/* 评分概览 */}
              <div className="eval-scores">
                <div className="score-main">
                  <div className="score-circle" style={{ 
                    background: `conic-gradient(${getScoreColor(result.overall)} ${result.overall}%, #f0f0f5 0)`
                  }}>
                    <div className="score-inner">
                      <span className="score-value">{result.overall}</span>
                      <span className="score-label">综合评分</span>
                    </div>
                  </div>
                </div>
                <div className="score-details">
                  {[
                    { key: 'accuracy', label: '准确性', icon: '🎯' },
                    { key: 'fidelity', label: '忠实度', icon: '📋' },
                    { key: 'fluency', label: '流畅度', icon: '💬' },
                    { key: 'grammar', label: '语法', icon: '📝' },
                  ].map(item => (
                    <div key={item.key} className="score-item">
                      <div className="score-item-header">
                        <span>{item.icon} {item.label}</span>
                        <span className="score-item-value" style={{ color: getScoreColor(result[item.key]) }}>
                          {result[item.key]}
                        </span>
                      </div>
                      <div className="score-bar">
                        <div 
                          className="score-bar-fill" 
                          style={{ 
                            width: `${result[item.key]}%`,
                            background: getScoreColor(result[item.key])
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 建议 */}
              <div className="eval-suggestions">
                <h3>💡 AI 评估建议</h3>
                <div className="suggestions-content">
                  {result.suggestions || '暂无建议'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
