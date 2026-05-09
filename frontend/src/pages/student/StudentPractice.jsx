import React, { useState } from 'react';
import questionsAPI from '../../services/questions';
import './Student.css';

const DIFFICULTY_OPTIONS = [
  { key: 'mixed', label: '混合' },
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' },
];

const COUNT_OPTIONS = [5, 10, 15, 20];

const DIFFICULTY_LABEL = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  mixed: '混合',
};

export default function StudentPractice() {
  /* ---------- 状态 ---------- */
  const [difficulty, setDifficulty] = useState('mixed');
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [err, setErr] = useState('');

  // 阶段: setup | practice | result
  const [phase, setPhase] = useState('setup');

  /* ---------- 获取练习题 ---------- */
  const handleStart = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await questionsAPI.practice({ difficulty, count });
      const data = res.data || res;
      const list = data.questions || data.list || data || [];
      if (!Array.isArray(list) || list.length === 0) {
        setErr('暂无符合条件的题目，请更换筛选条件');
        return;
      }
      setQuestions(list);
      setAnswers({});
      setSubmitted(false);
      setResults([]);
      setScore(0);
      setPhase('practice');
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '获取题目失败');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 答题 ---------- */
  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  /* ---------- 提交答案 ---------- */
  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      if (!window.confirm(`还有 ${questions.length - answeredCount} 题未作答，确定提交吗？`)) return;
    }
    setLoading(true);
    setErr('');
    try {
      const answersList = questions.map((q) => ({
        questionId: q._id || q.id,
        userAnswer: answers[q._id || q.id] || '',
      }));
      const res = await questionsAPI.check({ answers: answersList });
      const data = res.data || res;
      setResults(data.results || data.list || data || []);
      setScore(data.score ?? data.correct ?? 0);
      setSubmitted(true);
      setPhase('result');
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 重新练习 ---------- */
  const handleRestart = () => {
    setPhase('setup');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setResults([]);
    setScore(0);
    setErr('');
  };

  /* ---------- 已答题数 ---------- */
  const answeredCount = Object.keys(answers).filter(
    (id) => answers[id] !== '' && answers[id] !== undefined
  ).length;

  /* ---------- 渲染：设置阶段 ---------- */
  if (phase === 'setup') {
    return (
      <div className="page">
        <div className="card">
          <div className="card-head">练习设置</div>

          {/* 难度选择 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>选择难度</div>
            <div className="pills">
              {DIFFICULTY_OPTIONS.map((d) => (
                <span
                  key={d.key}
                  className={`pill${difficulty === d.key ? ' active' : ''}`}
                  onClick={() => setDifficulty(d.key)}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* 题目数量 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>题目数量</div>
            <div className="pills">
              {COUNT_OPTIONS.map((n) => (
                <span
                  key={n}
                  className={`pill${count === n ? ' active' : ''}`}
                  onClick={() => setCount(n)}
                >
                  {n} 题
                </span>
              ))}
            </div>
          </div>

          {err && (
            <div style={{ color: '#e03131', marginBottom: 12, fontSize: 14 }}>{err}</div>
          )}

          <button
            className="btn primary"
            onClick={handleStart}
            disabled={loading}
            style={{ width: '100%', padding: '12px 0', fontSize: 16 }}
          >
            {loading ? '加载中...' : '开始练习'}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- 渲染：结果阶段 ---------- */
  if (phase === 'result') {
    const correctCount = results.filter((r) => r.correct).length;
    const wrongCount = results.length - correctCount;

    return (
      <div className="page">
        {/* 成绩总结卡片 */}
        <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
          <div className="card-head" style={{ justifyContent: 'center', fontSize: 18 }}>
            练习结果
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800 }}>{score}</span>
                <span style={{ fontSize: 11 }}>分</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 14, color: '#555' }}>
                共 <b>{results.length}</b> 题
              </div>
              <div style={{ fontSize: 14, color: '#099268' }}>
                正确 <b>{correctCount}</b> 题
              </div>
              <div style={{ fontSize: 14, color: '#e03131' }}>
                错误 <b>{wrongCount}</b> 题
              </div>
            </div>
          </div>
          <button className="btn primary" onClick={handleRestart} style={{ width: '100%' }}>
            再来一次
          </button>
        </div>

        {/* 逐题回顾 */}
        <div className="list">
          {results.map((r, idx) => {
            const q = questions.find(
              (item) => (item._id || item.id) === (r.questionId || r._id)
            );
            return (
              <div
                key={r.questionId || r._id || idx}
                className="item"
                style={{
                  borderLeft: r.correct ? '4px solid #22c55e' : '4px solid #e03131',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      background: r.correct ? '#d4f5e9' : '#ffe3e3',
                      color: r.correct ? '#099268' : '#e03131',
                    }}
                  >
                    {r.correct ? '正确' : '错误'}
                  </span>
                  <span className="tag">
                    {q?.difficulty ? DIFFICULTY_LABEL[q.difficulty] || q.difficulty : ''}
                  </span>
                  <span className="tag">{q?.type === 'choice' ? '选择题' : '填空题'}</span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {idx + 1}. {q?.question || r.question || ''}
                </div>

                {/* 选择题选项 */}
                {q?.type === 'choice' && q.options && (
                  <div style={{ display: 'grid', gap: 4, marginBottom: 8 }}>
                    {q.options.map((opt, oi) => {
                      const optLabel = ['A', 'B', 'C', 'D'][oi] || String(oi + 1);
                      const isUserAnswer = answers[q._id || q.id] === optLabel;
                      const isCorrectAnswer = (q.answer || r.correctAnswer) === optLabel;
                      let bg = '#f8f9fa';
                      if (isCorrectAnswer) bg = '#d4f5e9';
                      else if (isUserAnswer && !isCorrectAnswer) bg = '#ffe3e3';
                      return (
                        <div
                          key={oi}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: bg,
                            fontSize: 14,
                          }}
                        >
                          {optLabel}. {typeof opt === 'object' ? opt.text || opt.label : opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 填空题答案 */}
                {q?.type === 'fill' && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#555' }}>
                      你的答案：<span style={{ color: r.correct ? '#099268' : '#e03131', fontWeight: 600 }}>
                        {r.userAnswer || '（未作答）'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#555' }}>
                      正确答案：<span style={{ fontWeight: 600 }}>{q.answer || r.correctAnswer}</span>
                    </div>
                  </div>
                )}

                {/* 解析 */}
                {(q?.explanation || r.explanation) && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '8px 12px',
                      background: '#f0f4ff',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#555',
                      lineHeight: 1.6,
                    }}
                  >
                    <b style={{ color: '#667eea' }}>解析：</b>
                    {q.explanation || r.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- 渲染：练习阶段 ---------- */
  return (
    <div className="page">
      {/* 进度条 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>练习进行中</span>
          <span style={{ fontSize: 14, color: '#666' }}>
            已答 {answeredCount} / {questions.length} 题
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 8,
            background: '#e9ecef',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {err && (
        <div style={{ color: '#e03131', marginBottom: 12, fontSize: 14 }}>{err}</div>
      )}

      {/* 题目列表 */}
      <div className="list">
        {questions.map((q, idx) => {
          const qId = q._id || q.id;
          const isChoice = q.type === 'choice';
          const userAnswer = answers[qId] || '';

          return (
            <div key={qId} className="item" style={{ padding: 16 }}>
              {/* 题目头部 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: userAnswer ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e9ecef',
                    color: userAnswer ? '#fff' : '#868e96',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span className="tag">
                  {q.difficulty ? DIFFICULTY_LABEL[q.difficulty] || q.difficulty : ''}
                </span>
                <span className="tag">{isChoice ? '选择题' : '填空题'}</span>
              </div>

              {/* 题目文本 */}
              <div style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>
                {q.question}
              </div>

              {/* 选择题选项 */}
              {isChoice && q.options && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {q.options.map((opt, oi) => {
                    const optLabel = ['A', 'B', 'C', 'D'][oi] || String(oi + 1);
                    const optText = typeof opt === 'object' ? opt.text || opt.label : opt;
                    const isSelected = userAnswer === optLabel;
                    return (
                      <label
                        key={oi}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #667eea' : '1px solid #e9ecef',
                          background: isSelected ? '#f0f4ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${qId}`}
                          value={optLabel}
                          checked={isSelected}
                          onChange={() => handleAnswer(qId, optLabel)}
                          style={{ accentColor: '#667eea' }}
                        />
                        <span style={{ fontWeight: 600, color: '#667eea', fontSize: 14 }}>
                          {optLabel}.
                        </span>
                        <span style={{ fontSize: 14 }}>{optText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 填空题输入 */}
              {!isChoice && (
                <input
                  className="input full"
                  placeholder="请输入你的答案..."
                  value={userAnswer}
                  onChange={(e) => handleAnswer(qId, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 提交按钮 */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          className="btn primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '12px 48px', fontSize: 16 }}
        >
          {loading ? '提交中...' : '提交答案'}
        </button>
        <div style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={handleRestart}>
            返回设置
          </button>
        </div>
      </div>
    </div>
  );
}
