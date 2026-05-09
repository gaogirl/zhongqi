import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import libraryAPI from '../../services/library';
import './StudentLibrary.css';

const DOMAINS = [
  { key: '', name: '全部', icon: '📚', colorClass: '' },
  { key: '科技翻译', name: '科技翻译', icon: '🔬', colorClass: 'cat-sci' },
  { key: '商务翻译', name: '商务翻译', icon: '💼', colorClass: 'cat-biz' },
  { key: '口译', name: '口译', icon: '🎙️', colorClass: 'cat-interp' },
  { key: '游戏本地化', name: '游戏本地化', icon: '🎮', colorClass: 'cat-game' },
  { key: '法律翻译', name: '法律翻译', icon: '⚖️', colorClass: 'cat-law' },
];

const DIFFICULTY_MAP = {
  beginner: { label: '初级', className: 'beginner' },
  intermediate: { label: '中级', className: 'intermediate' },
  advanced: { label: '高级', className: 'advanced' },
};

export default function StudentCases() {
  const [key, setKey] = useState('');
  const [domain, setDomain] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchCases = async (domainKey) => {
    setLoading(true);
    setErr('');
    try {
      const params = { key, page: 1, pageSize: 30 };
      if (domainKey !== undefined ? domainKey : domain) {
        params.domain = domainKey !== undefined ? domainKey : domain;
      }
      const res = await libraryAPI.listCases(params);
      const data = res.data || res;
      setList(data.list || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    /* eslint-disable-next-line */
  }, []);

  const handleDomainClick = (domainKey) => {
    setDomain(domainKey);
    setKey('');
    fetchCases(domainKey);
  };

  const handleSearch = () => {
    fetchCases();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchCases();
  };

  // 计算每个领域的数量
  const domainCounts = useMemo(() => {
    const counts = {};
    list.forEach((c) => {
      const d = c.domain || '未分类';
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [list]);

  // 过滤后的列表
  const filtered = useMemo(() => {
    if (!key.trim()) return list;
    const kw = key.toLowerCase();
    return list.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(kw)) ||
        (c.summary && c.summary.toLowerCase().includes(kw)) ||
        (c.domain && c.domain.toLowerCase().includes(kw))
    );
  }, [list, key]);

  return (
    <div className="lib-page">
      {/* 渐变头部 */}
      <div className="lib-header">
        <div className="lib-header-title">案例库</div>
        <div className="lib-header-subtitle">精选翻译实战案例，提升翻译实践能力</div>
      </div>

      {/* 标签切换 */}
      <div className="lib-tabs">
        <Link to="/student/terms" className="lib-tab">术语库</Link>
        <Link to="/student/cases" className="lib-tab active">案例库</Link>
      </div>

      {/* 搜索栏 */}
      <div className="lib-search-wrap">
        <span className="lib-search-icon">🔍</span>
        <input
          className="lib-search"
          placeholder="搜索案例标题、领域或摘要..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* 分类网格 */}
      <div className="lib-category-grid">
        {DOMAINS.map((d) => {
          const count = d.key ? (domainCounts[d.key] || 0) : list.length;
          return (
            <div
              key={d.key || 'all'}
              className={`lib-category-item${domain === d.key ? ' active' : ''}`}
              onClick={() => handleDomainClick(d.key)}
            >
              <div className={`lib-category-icon ${d.colorClass}`}>{d.icon}</div>
              <div className="lib-category-name">{d.name}</div>
              <div className="lib-category-count">{count} 项</div>
            </div>
          );
        })}
      </div>

      {/* 错误提示 */}
      {err && <div className="lib-error">{err}</div>}

      {/* 统计 */}
      <div className="lib-stats">
        共 <span className="lib-stats-count">{filtered.length}</span> 个案例
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="lib-loading">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="lib-empty">
          <div className="lib-empty-icon">📭</div>
          <div className="lib-empty-text">暂无案例数据</div>
        </div>
      ) : (
        <div className="lib-card-grid">
          {filtered.map((c) => {
            const diff = DIFFICULTY_MAP[c.difficulty] || null;
            return (
              <div key={c._id} className="lib-case-card">
                <div className="lib-case-card-cover">{c.coverImage || '📄'}</div>
                <div className="lib-case-card-body">
                  <div className="lib-case-card-title">{c.title}</div>
                  <span className="lib-case-card-domain">{c.domain || '未分类'}</span>
                  <div className="lib-case-card-summary">{c.summary || '暂无摘要'}</div>
                  {(c.tags && c.tags.length > 0) && (
                    <div className="lib-case-card-tags">
                      {c.tags.map((tag, i) => (
                        <span key={i} className="lib-case-card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="lib-case-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {diff && <span className={`lib-difficulty ${diff.className}`}>{diff.label}</span>}
                      {c.estimatedTime && (
                        <span className="lib-case-card-time">⏱ {c.estimatedTime}</span>
                      )}
                    </div>
                    <Link className="lib-case-card-link" to={`/student/cases/${c._id}`}>
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
