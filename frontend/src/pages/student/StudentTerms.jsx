import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import libraryAPI from '../../services/library';
import './StudentLibrary.css';

const CATEGORIES = [
  { key: '', name: '全部', icon: '📚', colorClass: '' },
  { key: '翻译技术', name: '翻译技术', icon: '💻', colorClass: 'cat-tech' },
  { key: '语言学基础', name: '语言学基础', icon: '📖', colorClass: 'cat-linguistics' },
  { key: '翻译工具', name: '翻译工具', icon: '🔧', colorClass: 'cat-tools' },
  { key: '翻译方法', name: '翻译方法', icon: '📝', colorClass: 'cat-methods' },
  { key: '翻译实践', name: '翻译实践', icon: '🎯', colorClass: 'cat-practice' },
  { key: '口译', name: '口译', icon: '🎙️', colorClass: 'cat-interpreting' },
  { key: '视听翻译', name: '视听翻译', icon: '🎬', colorClass: 'cat-av' },
];

const DIFFICULTY_MAP = {
  beginner: { label: '初级', className: 'beginner' },
  intermediate: { label: '中级', className: 'intermediate' },
  advanced: { label: '高级', className: 'advanced' },
};

export default function StudentTerms() {
  const [key, setKey] = useState('');
  const [cat, setCat] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchTerms = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await libraryAPI.listTerms({ key, cat, page: 1, pageSize: 200 });
      const data = res.data || res;
      setList(data.list || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
    /* eslint-disable-next-line */
  }, []);

  const handleCatClick = (catKey) => {
    setCat(catKey);
    setTimeout(() => {
      setKey('');
      fetchTermsWithCat(catKey);
    }, 0);
  };

  const fetchTermsWithCat = async (catKey) => {
    setLoading(true);
    setErr('');
    try {
      const params = { page: 1, pageSize: 200 };
      if (catKey) params.cat = catKey;
      const res = await libraryAPI.listTerms(params);
      const data = res.data || res;
      setList(data.list || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTerms();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchTerms();
  };

  // 计算每个分类的数量
  const catCounts = useMemo(() => {
    const counts = {};
    list.forEach((t) => {
      const c = t.cat || '未分类';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [list]);

  // 过滤后的列表
  const filtered = useMemo(() => {
    if (!key.trim()) return list;
    const kw = key.toLowerCase();
    return list.filter(
      (t) =>
        (t.term && t.term.toLowerCase().includes(kw)) ||
        (t.meaning && t.meaning.toLowerCase().includes(kw))
    );
  }, [list, key]);

  return (
    <div className="lib-page">
      {/* 渐变头部 */}
      <div className="lib-header">
        <div className="lib-header-title">术语库</div>
        <div className="lib-header-subtitle">系统学习翻译专业术语，夯实理论基础</div>
      </div>

      {/* 标签切换 */}
      <div className="lib-tabs">
        <Link to="/student/terms" className="lib-tab active">术语库</Link>
        <Link to="/student/cases" className="lib-tab">案例库</Link>
      </div>

      {/* 搜索栏 */}
      <div className="lib-search-wrap">
        <span className="lib-search-icon">🔍</span>
        <input
          className="lib-search"
          placeholder="搜索术语名称或释义..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* 分类网格 */}
      <div className="lib-category-grid">
        {CATEGORIES.map((c) => {
          const count = c.key ? (catCounts[c.key] || 0) : list.length;
          return (
            <div
              key={c.key || 'all'}
              className={`lib-category-item${cat === c.key ? ' active' : ''}`}
              onClick={() => handleCatClick(c.key)}
            >
              <div className={`lib-category-icon ${c.colorClass}`}>{c.icon}</div>
              <div className="lib-category-name">{c.name}</div>
              <div className="lib-category-count">{count} 项</div>
            </div>
          );
        })}
      </div>

      {/* 错误提示 */}
      {err && <div className="lib-error">{err}</div>}

      {/* 统计 */}
      <div className="lib-stats">
        共 <span className="lib-stats-count">{filtered.length}</span> 个术语
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="lib-loading">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="lib-empty">
          <div className="lib-empty-icon">📭</div>
          <div className="lib-empty-text">暂无术语数据</div>
        </div>
      ) : (
        <div className="lib-card-grid">
          {filtered.map((t) => {
            const diff = DIFFICULTY_MAP[t.difficulty] || null;
            return (
              <div key={t._id} className="lib-term-card">
                <div className="lib-term-card-header">
                  <div className="lib-term-card-icon">{t.icon || '📖'}</div>
                  <div className="lib-term-card-info">
                    <div className="lib-term-card-name">{t.term}</div>
                    <span className="lib-term-card-cat">{t.cat || '未分类'}</span>
                  </div>
                </div>
                <div className="lib-term-card-meaning">{t.meaning}</div>
                <div className="lib-term-card-footer">
                  {diff && <span className={`lib-difficulty ${diff.className}`}>{diff.label}</span>}
                  {!diff && <span />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
