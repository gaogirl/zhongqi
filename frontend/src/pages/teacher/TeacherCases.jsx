import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import libraryAPI from '../../services/library';
import './TeacherLibrary.css';

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

const EMOJI_OPTIONS = ['📄', '🔬', '💼', '🎙️', '🎮', '⚖️', '🌐', '📊', '💡', '🎯', '📐', '🎓', '📝', '📖', '💬', '🔧'];

const DOMAIN_KEYS = DOMAINS.filter((d) => d.key).map((d) => d.key);

export default function TeacherCases() {
  const [key, setKey] = useState('');
  const [domain, setDomain] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    id: null,
    title: '',
    domain: DOMAIN_KEYS[0],
    tags: '',
    summary: '',
    content: '',
    difficulty: 'beginner',
    estimatedTime: '',
    coverImage: '📄',
  });

  const fetchCases = async (domainKey) => {
    setLoading(true);
    setErr('');
    try {
      const params = { key, page: 1, pageSize: 50 };
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

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      domain: DOMAIN_KEYS[0],
      tags: '',
      summary: '',
      content: '',
      difficulty: 'beginner',
      estimatedTime: '',
      coverImage: '📄',
    });
    setShowForm(false);
  };

  const onEdit = async (c) => {
    try {
      const res = await libraryAPI.getCase(c._id);
      const d = res.data || res;
      setForm({
        id: d._id,
        title: d.title || '',
        domain: d.domain || DOMAIN_KEYS[0],
        tags: (d.tags || []).join(','),
        summary: d.summary || '',
        content: d.content || '',
        difficulty: d.difficulty || 'beginner',
        estimatedTime: d.estimatedTime || '',
        coverImage: d.coverImage || '📄',
      });
      setShowForm(true);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '加载详情失败');
    }
  };

  const onSave = async () => {
    const payload = {
      title: form.title,
      domain: form.domain,
      summary: form.summary,
      content: form.content,
      difficulty: form.difficulty,
      estimatedTime: form.estimatedTime,
      coverImage: form.coverImage,
      tags: (form.tags || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (!payload.title?.trim()) return alert('请填写案例标题');
    try {
      if (form.id) {
        await libraryAPI.updateCase(form.id, payload);
      } else {
        await libraryAPI.createCase(payload);
      }
      resetForm();
      await fetchCases();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '保存失败');
    }
  };

  const onDel = async (c) => {
    if (!confirm('确定删除该案例？')) return;
    try {
      await libraryAPI.deleteCase(c._id);
      await fetchCases();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '删除失败');
    }
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
        <div className="lib-header-title">案例管理</div>
        <div className="lib-header-subtitle">管理翻译教学案例，添加和编辑实战内容</div>
      </div>

      {/* 标签切换 */}
      <div className="lib-tabs">
        <Link to="/teacher/terms" className="lib-tab">术语库</Link>
        <Link to="/teacher/cases" className="lib-tab active">案例库</Link>
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

      {/* 新增按钮 */}
      {!showForm && (
        <div style={{ marginBottom: 20 }}>
          <button className="lib-btn lib-btn-primary" onClick={() => setShowForm(true)}>
            + 新增案例
          </button>
        </div>
      )}

      {/* 表单面板 */}
      {showForm && (
        <div className="lib-form-panel">
          <div className="lib-form-title">
            {form.id ? '编辑案例' : '新增案例'}
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">案例标题 *</label>
              <input
                className="lib-form-input"
                placeholder="请输入案例标题"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="lib-form-group">
              <label className="lib-form-label">所属领域</label>
              <select
                className="lib-form-select"
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              >
                {DOMAIN_KEYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">标签（逗号分隔）</label>
              <input
                className="lib-form-input"
                placeholder="例如：科技,术语,本地化"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="lib-form-group">
              <label className="lib-form-label">预计用时</label>
              <input
                className="lib-form-input"
                placeholder="例如：30分钟"
                value={form.estimatedTime}
                onChange={(e) => setForm((f) => ({ ...f, estimatedTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">封面图标</label>
              <div className="lib-icon-picker">
                {EMOJI_OPTIONS.map((emoji) => (
                  <div
                    key={emoji}
                    className={`lib-icon-option${form.coverImage === emoji ? ' active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, coverImage: emoji }))}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">难度</label>
              <div className="lib-difficulty-picker">
                {Object.entries(DIFFICULTY_MAP).map(([key, val]) => (
                  <div
                    key={key}
                    className={`lib-difficulty-option ${val.className}${form.difficulty === key ? ' active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, difficulty: key }))}
                  >
                    {val.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">摘要</label>
              <textarea
                className="lib-form-textarea"
                placeholder="请输入案例摘要"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              />
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">正文内容（支持纯文本/Markdown）</label>
              <textarea
                className="lib-form-textarea"
                style={{ minHeight: 140 }}
                placeholder="请输入案例正文内容..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
          </div>

          <div className="lib-form-actions">
            <button className="lib-btn lib-btn-primary" onClick={onSave}>
              {form.id ? '保存修改' : '新增案例'}
            </button>
            <button className="lib-btn lib-btn-ghost" onClick={resetForm}>
              取消
            </button>
          </div>
        </div>
      )}

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
                  </div>
                  <div className="lib-card-actions">
                    <button className="lib-btn lib-btn-edit" onClick={() => onEdit(c)}>
                      编辑
                    </button>
                    <button className="lib-btn lib-btn-danger" onClick={() => onDel(c)}>
                      删除
                    </button>
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
