import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import libraryAPI from '../../services/library';
import './StudentLibrary.css';

// 术语分类配置
const TERM_CATS = [
  { key: '', label: '全部', icon: '📚', color: '#667eea' },
  { key: '翻译技术', label: '翻译技术', icon: '🤖', color: '#4facfe' },
  { key: '语言学基础', label: '语言学基础', icon: '📖', color: '#43e97b' },
  { key: '翻译工具', label: '翻译工具', icon: '🛠️', color: '#fa709a' },
  { key: '翻译方法', label: '翻译方法', icon: '🔄', color: '#30cfd0' },
  { key: '翻译实践', label: '翻译实践', icon: '🌍', color: '#f093fb' },
  { key: '口译', label: '口译', icon: '🎤', color: '#ff9a9e' },
  { key: '视听翻译', label: '视听翻译', icon: '🎬', color: '#a8edea' },
];

// 案例分类配置
const CASE_CATS = [
  { key: '', label: '全部', icon: '📂', color: '#667eea' },
  { key: '科技翻译', label: '科技翻译', icon: '💻', color: '#4facfe' },
  { key: '商务翻译', label: '商务翻译', icon: '💼', color: '#43e97b' },
  { key: '口译', label: '口译', icon: '🎙️', color: '#fa709a' },
  { key: '游戏本地化', label: '游戏本地化', icon: '🎮', color: '#30cfd0' },
  { key: '法律翻译', label: '法律翻译', icon: '⚖️', color: '#f093fb' },
];

// 难度标签
const DifficultyBadge = ({ level }) => {
  const config = {
    beginner: { text: '初级', class: 'beginner' },
    intermediate: { text: '中级', class: 'intermediate' },
    advanced: { text: '高级', class: 'advanced' },
  };
  const cfg = config[level] || config.intermediate;
  return (
    <span className={`lib-difficulty ${cfg.class}`}>
      {cfg.text}
    </span>
  );
};

export default function StudentLibrary() {
  const [activeTab, setActiveTab] = useState('terms');
  const [terms, setTerms] = useState([]);
  const [cases, setCases] = useState([]);
  const [termCat, setTermCat] = useState('');
  const [caseCat, setCaseCat] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const [termRes, caseRes] = await Promise.all([
        libraryAPI.listTerms({ page: 1, pageSize: 200 }),
        libraryAPI.listCases({ page: 1, pageSize: 50 }),
      ]);
      setTerms(termRes.data?.list || termRes.list || []);
      setCases(caseRes.data?.list || caseRes.list || []);
    } catch (e) {
      console.error('加载数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 过滤数据
  const filteredTerms = terms.filter(t => {
    const matchCat = !termCat || t.cat === termCat;
    const matchSearch = !searchKey || 
      t.term?.toLowerCase().includes(searchKey.toLowerCase()) ||
      t.meaning?.toLowerCase().includes(searchKey.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredCases = cases.filter(c => {
    const matchCat = !caseCat || c.domain === caseCat;
    const matchSearch = !searchKey ||
      c.title?.toLowerCase().includes(searchKey.toLowerCase()) ||
      c.summary?.toLowerCase().includes(searchKey.toLowerCase());
    return matchCat && matchSearch;
  });

  // 统计每个分类的数量
  const getTermCount = (cat) => cat ? terms.filter(t => t.cat === cat).length : terms.length;
  const getCaseCount = (cat) => cat ? cases.filter(c => c.domain === cat).length : cases.length;

  return (
    <div className="lib-page">
      {/* 头部区域 */}
      <div className="lib-header">
        <div className="lib-header-title">📚 学习资源库</div>
        <div className="lib-header-subtitle">系统学习翻译专业知识，夯实理论基础，提升实践能力</div>
      </div>

      {/* Tab 切换 */}
      <div className="lib-tabs">
        <button 
          className={`lib-tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          专业术语
        </button>
        <button 
          className={`lib-tab ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          案例分析
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="lib-search-wrap">
        <span className="lib-search-icon">🔍</span>
        <input
          type="text"
          className="lib-search"
          placeholder={activeTab === 'terms' ? '搜索术语名称或释义...' : '搜索案例标题、领域或摘要...'}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </div>

      {/* 分类网格 */}
      <div className="lib-category-grid">
        {activeTab === 'terms' ? (
          TERM_CATS.map(cat => (
            <div
              key={cat.key}
              className={`lib-category-item ${termCat === cat.key ? 'active' : ''}`}
              onClick={() => setTermCat(cat.key)}
            >
              <div className="lib-category-icon" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}>
                {cat.icon}
              </div>
              <div className="lib-category-name">{cat.label}</div>
              <div className="lib-category-count">{getTermCount(cat.key)} 个术语</div>
            </div>
          ))
        ) : (
          CASE_CATS.map(cat => (
            <div
              key={cat.key}
              className={`lib-category-item ${caseCat === cat.key ? 'active' : ''}`}
              onClick={() => setCaseCat(cat.key)}
            >
              <div className="lib-category-icon" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}>
                {cat.icon}
              </div>
              <div className="lib-category-name">{cat.label}</div>
              <div className="lib-category-count">{getCaseCount(cat.key)} 个案例</div>
            </div>
          ))
        )}
      </div>

      {/* 统计 */}
      <div className="lib-stats">
        共 <span className="lib-stats-count">{activeTab === 'terms' ? filteredTerms.length : filteredCases.length}</span> 个{activeTab === 'terms' ? '术语' : '案例'}
      </div>

      {/* 内容列表 */}
      {loading ? (
        <div className="lib-loading">加载中...</div>
      ) : activeTab === 'terms' ? (
        <div className="lib-card-grid">
          {filteredTerms.map(term => (
            <div key={term._id} className="lib-term-card">
              <div className="lib-term-card-header">
                <div className="lib-term-card-icon">{term.icon || '📚'}</div>
                <div className="lib-term-card-info">
                  <div className="lib-term-card-name">{term.term}</div>
                  <span className="lib-term-card-cat">{term.cat || '未分类'}</span>
                </div>
              </div>
              <div className="lib-term-card-meaning">{term.meaning}</div>
              <div className="lib-term-card-footer">
                <DifficultyBadge level={term.difficulty} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lib-card-grid">
          {filteredCases.map(c => (
            <div key={c._id} className="lib-case-card">
              <div className="lib-case-card-cover" style={{
                background: c.gradient ? 
                  `linear-gradient(135deg, ${c.gradient.from}, ${c.gradient.to})` :
                  'linear-gradient(135deg, #667eea, #764ba2)'
              }}>
                <span style={{ fontSize: '52px' }}>{c.coverImage || '📖'}</span>
              </div>
              <div className="lib-case-card-body">
                <div className="lib-case-card-title">{c.title}</div>
                <span className="lib-case-card-domain">{c.domain || '未分类'}</span>
                <div className="lib-case-card-summary">{c.summary}</div>
                <div className="lib-case-card-tags">
                  {(c.tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="lib-case-card-tag">{tag}</span>
                  ))}
                </div>
                <div className="lib-case-card-footer">
                  <span className="lib-case-card-time">⏱️ {c.estimatedTime || '30分钟'}</span>
                  <Link to={`/student/cases/${c._id}`} className="lib-case-card-link">查看详情</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && (activeTab === 'terms' ? filteredTerms : filteredCases).length === 0 && (
        <div className="lib-empty">
          <div className="lib-empty-icon">{activeTab === 'terms' ? '📚' : '📂'}</div>
          <div className="lib-empty-text">
            {activeTab === 'terms' ? '暂无术语' : '暂无案例'}
          </div>
        </div>
      )}
    </div>
  );
}
