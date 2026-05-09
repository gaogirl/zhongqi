import React, { useState, useEffect } from 'react';
import './Student.css';
import { translateRequest } from '../../services/ai';
import api from '../../services/api';

// AI评测卡片 - 从API获取真实数据
const AIAssessCard = ({ data }) => {
  const { overallScore = 0, level = '待评测', strengths = [], suggestions = [] } = data || {};
  
  return (
    <div className="card assess-card">
      <div className="card-head">
        <span>个人能力 AI 评测</span>
      </div>
      <div className="assess-content">
        <div className="assess-score">
          <div className="score-num">{overallScore || '-'}</div>
          <div className="score-sub">综合得分</div>
        </div>
        <div className="assess-meta">
          <div>等级：<b>{level}</b></div>
          <div>
            优势：{(strengths.length > 0 ? strengths : ['基础扎实']).slice(0, 3).map((s, i) => (
              <span key={i} className="tag ok">{s}</span>
            ))}
          </div>
          <div>建议：{suggestions.length > 0 ? suggestions[0] : '保持练习频率'}</div>
        </div>
      </div>
    </div>
  );
};

const StudentHome = () => {
  const [from, setFrom] = useState('中文');
  const [to, setTo] = useState('英文');
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  
  // AI评测数据
  const [aiAssess, setAiAssess] = useState(null);
  const [assessLoading, setAssessLoading] = useState(true);

  // 获取AI评测数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setAssessLoading(true);
        const res = await api.get('/users/stats');
        setAiAssess(res.data?.aiAssessment || null);
      } catch (e) {
        // 静默失败，不影响页面使用
        console.warn('获取统计数据失败:', e?.message);
      } finally {
        setAssessLoading(false);
      }
    };
    fetchStats();
  }, []);

  const onTranslate = async () => {
    if (!src.trim()) {
      setErr('请输入待翻译文本');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const data = await translateRequest(src, {
        sourceLanguage: from === '中文' ? 'zh' : from === '英文' ? 'en' : 'ja',
        targetLanguage: to === '中文' ? 'zh' : to === '英文' ? 'en' : 'ja',
        model: 'glm-4.5',
        stream: false
      });
      setDst(data.translation || '');
    } catch (e) {
      setErr(typeof e?.message === 'string' ? e.message : '翻译失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="grid two">
        {assessLoading ? (
          <div className="card assess-card">
            <div className="card-head">个人能力 AI 评测</div>
            <div style={{ padding: 20, textAlign: 'center', color: '#868e96' }}>加载中...</div>
          </div>
        ) : (
          <AIAssessCard data={aiAssess} />
        )}
        <div className="card">
          <div className="card-head">
            <span>人工智能辅助翻译</span>
          </div>
          <div className="trans-toolbar">
            <div className="selects">
              <label>源语言
                <select value={from} onChange={e=>setFrom(e.target.value)}>
                  <option>中文</option>
                  <option>英文</option>
                  <option>日文</option>
                </select>
              </label>
              <label>目标语言
                <select value={to} onChange={e=>setTo(e.target.value)}>
                  <option>中文</option>
                  <option>英文</option>
                  <option>日文</option>
                </select>
              </label>
            </div>
            <button className="btn primary" onClick={onTranslate} disabled={loading}>{loading ? '翻译中…' : '翻译'}</button>
          </div>
          {err && <div className="note" style={{marginBottom:8,color:'#e03131'}}>{err}</div>}
          <div className="trans-area">
            <textarea placeholder="请输入待翻译文本…" value={src} onChange={e=>setSrc(e.target.value)} />
            <textarea placeholder="译文将显示在此…" value={dst} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
