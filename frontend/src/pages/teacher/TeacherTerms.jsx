import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import libraryAPI from '../../services/library';
import './TeacherLibrary.css';

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

const ICON_OPTIONS = ['📖', '💻', '🔧', '📝', '🎯', '🎙️', '🎬', '🌐', '📊', '💡', '📐', '🔬', '🎓', '📚', '🔤', '💬'];

const CAT_KEYS = CATEGORIES.filter((c) => c.key).map((c) => c.key);

export default function TeacherTerms() {
  const [key, setKey] = useState('');
  const [cat, setCat] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    id: null,
    term: '',
    meaning: '',
    cat: CAT_KEYS[0],
    icon: '📖',
    difficulty: 'beginner',
  });

  const fetchTerms = async (catKey) => {
    setLoading(true);
    setErr('');
    try {
      const params = { key, page: 1, pageSize: 300 };
      if (catKey !== undefined ? catKey : cat) {
        params.cat = catKey !== undefined ? catKey : cat;
      }
      const res = await libraryAPI.listTerms(params);
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
    setKey('');
    fetchTerms(catKey);
  };

  const handleSearch = () => {
    fetchTerms();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchTerms();
  };

  const resetForm = () => {
    setForm({
      id: null,
      term: '',
      meaning: '',
      cat: CAT_KEYS[0],
      icon: '📖',
      difficulty: 'beginner',
    });
    setShowForm(false);
  };

  const onEdit = (t) => {
    setForm({
      id: t._id,
      term: t.term || '',
      meaning: t.meaning || '',
      cat: t.cat || CAT_KEYS[0],
      icon: t.icon || '📖',
      difficulty: t.difficulty || 'beginner',
    });
    setShowForm(true);
  };

  const onSave = async () => {
    const { id, term, meaning, cat, icon, difficulty } = form;
    if (!term.trim() || !meaning.trim()) return alert('请填写术语名称和释义');
    try {
      const payload = { term, meaning, cat, icon, difficulty };
      if (id) {
        await libraryAPI.updateTerm(id, payload);
      } else {
        await libraryAPI.createTerm(payload);
      }
      resetForm();
      await fetchTerms();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '保存失败');
    }
  };

  const onDel = async (t) => {
    if (!confirm('确定删除该术语？')) return;
    try {
      await libraryAPI.deleteTerm(t._id);
      await fetchTerms();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '删除失败');
    }
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
        <div className="lib-header-title">术语管理</div>
        <div className="lib-header-subtitle">管理翻译术语库，添加和编辑专业术语</div>
      </div>

      {/* 标签切换 */}
      <div className="lib-tabs">
        <Link to="/teacher/terms" className="lib-tab active">术语库</Link>
        <Link to="/teacher/cases" className="lib-tab">案例库</Link>
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

      {/* 新增按钮 */}
      {!showForm && (
        <div style={{ marginBottom: 20 }}>
          <button className="lib-btn lib-btn-primary" onClick={() => setShowForm(true)}>
            + 新增术语
          </button>
        </div>
      )}

      {/* 表单面板 */}
      {showForm && (
        <div className="lib-form-panel">
          <div className="lib-form-title">
            {form.id ? '编辑术语' : '新增术语'}
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">术语名称 *</label>
              <input
                className="lib-form-input"
                placeholder="请输入术语名称"
                value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
              />
            </div>
            <div className="lib-form-group">
              <label className="lib-form-label">分类</label>
              <select
                className="lib-form-select"
                value={form.cat}
                onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
              >
                {CAT_KEYS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lib-form-row">
            <div className="lib-form-group">
              <label className="lib-form-label">图标</label>
              <div className="lib-icon-picker">
                {ICON_OPTIONS.map((icon) => (
                  <div
                    key={icon}
                    className={`lib-icon-option${form.icon === icon ? ' active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, icon }))}
                  >
                    {icon}
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
              <label className="lib-form-label">释义 *</label>
              <textarea
                className="lib-form-textarea"
                placeholder="请输入术语释义"
                value={form.meaning}
                onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value }))}
              />
            </div>
          </div>

          <div className="lib-form-actions">
            <button className="lib-btn lib-btn-primary" onClick={onSave}>
              {form.id ? '保存修改' : '新增术语'}
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
                <div className="lib-card-actions">
                  <button className="lib-btn lib-btn-edit" onClick={() => onEdit(t)}>
                    编辑
                  </button>
                  <button className="lib-btn lib-btn-danger" onClick={() => onDel(t)}>
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
