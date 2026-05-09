import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './Student.css';

// AI评测卡片
const AIAssessCard = ({ data }) => {
  const { overallScore = 0, level = '待评测', strengths = [], suggestions = [] } = data || {};
  
  return (
    <div className="card">
      <div className="card-head">个人能力 AI 评测</div>
      <div className="assess-content">
        <div className="assess-score">
          <div className="score-num">{overallScore || '-'}</div>
          <div className="score-sub">综合得分</div>
        </div>
        <div className="assess-meta">
          <div>等级：<b>{level}</b></div>
          <div>
            优势：{strengths.slice(0, 2).map((s, i) => (
              <span key={i} className="tag ok">{s}</span>
            ))}
            {strengths.length === 0 && <span className="tag ok">基础扎实</span>}
          </div>
          <div>
            建议：{suggestions.slice(0, 3).join('、') || '保持练习频率'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 折线图（学习进度）
const LineChart = ({ data, width = 520, height = 240, padding = 28 }) => {
  if (!data || data.length === 0) {
    return (
      <svg className="svg-box" viewBox={`0 0 ${width} ${height}`}>
        <text x={width/2} y={height/2} textAnchor="middle" fill="#868e96" fontSize="14">暂无数据</text>
      </svg>
    );
  }
  
  const maxY = Math.max(...data.map(d => d.count), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const scaleY = (val) => height - padding - (val / maxY) * (height - padding * 2);

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${scaleY(d.count)}`).join(' ');

  return (
    <svg className="svg-box" viewBox={`0 0 ${width} ${height}`}> 
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e9ecef"/>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e9ecef"/>
      {[0.25,0.5,0.75,1].map((t,idx)=>{
        const y = padding + (height - padding*2) * t;
        return <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f3f5"/>;
      })}
      <path d={path} fill="none" stroke="#667eea" strokeWidth={3} />
      {data.map((d,i)=>{
        const cx = padding + i * stepX, cy = scaleY(d.count);
        return <g key={i}>
          <circle cx={cx} cy={cy} r={4} fill="#667eea" />
          <text x={cx} y={height - padding + 16} textAnchor="middle" fontSize="10" fill="#868e96">{d.day}</text>
        </g>;
      })}
      <text x={padding - 8} y={padding} textAnchor="end" fontSize="10" fill="#868e96">{maxY}</text>
      <text x={padding - 8} y={height - padding} textAnchor="end" fontSize="10" fill="#868e96">0</text>
    </svg>
  );
};

// 雷达图（话题熟悉度）
const RadarChart = ({ data, width = 360, height = 300 }) => {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  
  if (labels.length === 0) {
    return (
      <svg className="svg-box" viewBox={`0 0 ${width} ${height}`}>
        <text x={width/2} y={height/2} textAnchor="middle" fill="#868e96" fontSize="14">暂无数据</text>
      </svg>
    );
  }
  
  const cx = width / 2, cy = height / 2, r = Math.min(width, height) * 0.38;
  const max = 100;
  const angleStep = (Math.PI * 2) / labels.length;

  const points = values.map((v, i) => {
    const a = -Math.PI / 2 + angleStep * i;
    const rr = (v / max) * r;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });

  const ring = (ratio) => {
    const pts = labels.map((_, i) => {
      const a = -Math.PI / 2 + angleStep * i;
      const rr = r * ratio;
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    });
    return pts.map((p,i)=>`${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
  };

  const poly = points.map((p,i)=>`${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';

  return (
    <svg className="svg-box" viewBox={`0 0 ${width} ${height}`}>
      {[0.25,0.5,0.75,1].map((t,i)=> (
        <path key={i} d={ring(t)} fill="none" stroke="#e9ecef"/>
      ))}
      {labels.map((lab, i)=>{
        const a = -Math.PI / 2 + angleStep * i;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#f1f3f5" />
            <text x={x} y={y} fontSize="11" fill="#868e96" textAnchor="middle" dy={y<cy?-6:12}>{lab}</text>
          </g>
        );
      })}
      <path d={poly} fill="rgba(102,126,234,.25)" stroke="#667eea" strokeWidth={2} />
    </svg>
  );
};

// 统计卡片
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-icon" style={{ background: `${color}20`, color }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

const StudentProfile = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/stats');
        setStats(res.data);
      } catch (e) {
        setError(e?.response?.data?.error || '获取统计数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page profile-loading">
        <div className="loading-spinner"></div>
        <p>加载个人数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const { studyProgress, topicFamiliarity, aiAssessment, stats: summaryStats } = stats || {};

  return (
    <div className="page">
      {/* 统计卡片 */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard 
          title="连续学习" 
          value={`${summaryStats?.streak || 0}天`}
          icon="🔥"
          color="#ff6b6b"
        />
        <StatCard 
          title="总学习时长" 
          value={`${summaryStats?.totalHours || 0}小时`}
          icon="⏱️"
          color="#4ecdc4"
        />
        <StatCard 
          title="已完成作业" 
          value={summaryStats?.completedAssignments || 0}
          icon="✅"
          color="#45b7d1"
        />
        <StatCard 
          title="平均分" 
          value={summaryStats?.averageScore || '-'}
          icon="📊"
          color="#667eea"
        />
      </div>

      {/* 图表区域 */}
      <div className="profile-charts">
        <div className="card" style={{ flex: 1.5 }}>
          <div className="card-head">近7天学习进度</div>
          <LineChart data={studyProgress?.daily || []} />
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-head">话题熟悉度</div>
          <RadarChart data={topicFamiliarity || {}} />
        </div>
      </div>

      {/* AI评测 */}
      <AIAssessCard data={aiAssessment} />
    </div>
  );
};

export default StudentProfile;
