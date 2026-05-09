import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classesAPI from '../../services/classes';
import './Teacher.css';

export default function TeacherAnalytics() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await classesAPI.teaching();
        const data = res.data || res;
        setClasses(data || []);
        if ((data || []).length && !classId) setClassId(String(data[0]._id));
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || '加载班级失败');
      }
    })();
  }, []);

  const fetchBoard = async () => {
    if (!classId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await classesAPI.dashboard(classId);
      setBoard(res.data || res);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '获取数据看板失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBoard(); /* eslint-disable-next-line */ }, [classId]);

  // 获取分数颜色
  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="analytics-page">
      {/* 头部 */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>📊 数据看板</h1>
          <p>实时追踪班级学习进度与作业完成情况</p>
        </div>
        <div className="header-right">
          <select className="class-select" value={classId} onChange={e=>setClassId(e.target.value)}>
            {(classes || []).map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <Link className="btn-primary" to={classId?`/teacher/classes/${classId}`:'#'}>前往班级</Link>
        </div>
      </div>

      {err && <div className="analytics-error">{err}</div>}

      {loading ? (
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>加载数据中...</p>
        </div>
      ) : board ? (
        <>
          {/* 核心指标卡片 */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>👥</div>
              <div className="metric-info">
                <div className="metric-value">{board.membersCount}</div>
                <div className="metric-label">班级成员</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📝</div>
              <div className="metric-info">
                <div className="metric-value">{board.assignmentsCount}</div>
                <div className="metric-label">作业总数</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#d1fae5', color: '#059669' }}>✅</div>
              <div className="metric-info">
                <div className="metric-value">{board.totalSubmissions}</div>
                <div className="metric-label">已提交</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>📈</div>
              <div className="metric-info">
                <div className="metric-value">{(board.completionRate*100).toFixed(0)}%</div>
                <div className="metric-label">完成率</div>
              </div>
            </div>
            <div className="metric-card highlight">
              <div className="metric-icon" style={{ background: '#fce7f3', color: '#db2777' }}>🏆</div>
              <div className="metric-info">
                <div className="metric-value" style={{ color: getScoreColor(board.averageScore) }}>
                  {board.averageScore || '-'}
                </div>
                <div className="metric-label">平均分</div>
              </div>
            </div>
          </div>

          {/* 详细数据区 */}
          <div className="analytics-content">
            {/* 左侧：常见错误 */}
            <div className="analytics-panel">
              <div className="panel-header">
                <span className="panel-icon">⚠️</span>
                <span className="panel-title">常见错误分析</span>
              </div>
              <div className="panel-body">
                {board.commonMistakes && board.commonMistakes.length > 0 ? (
                  <div className="mistakes-list">
                    {board.commonMistakes.map((mistake, i) => (
                      <div key={i} className="mistake-item">
                        <span className="mistake-rank">{i + 1}</span>
                        <span className="mistake-text">{mistake}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>暂无错误数据</p>
                    <span>批改作业后，系统会自动分析常见错误</span>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：最近提交 */}
            <div className="analytics-panel">
              <div className="panel-header">
                <span className="panel-icon">🕐</span>
                <span className="panel-title">最近提交</span>
              </div>
              <div className="panel-body">
                {board.recentSubmissions && board.recentSubmissions.length > 0 ? (
                  <div className="submissions-list">
                    {board.recentSubmissions.map((sub) => (
                      <div key={sub._id} className="submission-item">
                        <div className="submission-info">
                          <div className="submission-student">{sub.student?.name || '学生'}</div>
                          <div className="submission-time">{formatDate(sub.submittedAt)}</div>
                        </div>
                        <div className="submission-status">
                          {sub.score !== null && sub.score !== undefined ? (
                            <span className="score-badge" style={{ 
                              background: getScoreColor(sub.score) + '20',
                              color: getScoreColor(sub.score)
                            }}>
                              {sub.score}分
                            </span>
                          ) : (
                            <span className="status-badge pending">待批改</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>暂无提交记录</p>
                    <span>学生提交作业后将显示在这里</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="analytics-empty">
          <div className="empty-icon">📊</div>
          <p>暂无数据</p>
          <span>请先选择班级或创建班级</span>
        </div>
      )}
    </div>
  );
}
