import React, { useEffect, useRef, useState } from 'react';
import questionsAPI from '../../services/questions';
import './Teacher.css';

const DIFFICULTY_OPTIONS = [
  { key: '', label: '全部' },
  { key: 'easy', label: '简单' },
  { key: 'medium', label: '中等' },
  { key: 'hard', label: '困难' },
];

const TYPE_OPTIONS = [
  { key: '', label: '全部' },
  { key: 'choice', label: '选择题' },
  { key: 'fill', label: '填空题' },
];

const DIFFICULTY_LABEL = { easy: '简单', medium: '中等', hard: '困难' };
const DIFFICULTY_COLOR = { easy: '#d4f5e9', medium: '#fff3bf', hard: '#ffe3e3' };
const DIFFICULTY_TEXT_COLOR = { easy: '#099268', medium: '#e67700', hard: '#e03131' };

const EMPTY_FORM = {
  type: 'choice',
  difficulty: 'medium',
  question: '',
  options: [
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ],
  answer: '',
  explanation: '',
  tags: '',
};

const PAGE_SIZE = 20;

export default function TeacherQuestions() {
  /* ---------- 列表状态 ---------- */
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  /* ---------- 筛选状态 ---------- */
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);

  /* ---------- 表单状态 ---------- */
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  /* ---------- 导入状态 ---------- */
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  /* ---------- 获取列表 ---------- */
  const fetchQuestions = async () => {
    setLoading(true);
    setErr('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterType) params.type = filterType;
      if (searchKey.trim()) params.key = searchKey.trim();
      const res = await questionsAPI.list(params);
      const data = res.data || res;
      setQuestions(data.list || data.questions || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    /* eslint-disable-next-line */
  }, [page, filterDifficulty, filterType]);

  const handleSearch = () => {
    setPage(1);
    fetchQuestions();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  /* ---------- 表单操作 ---------- */
  const openCreateForm = () => {
    setEditingQuestion(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEditForm = (q) => {
    setEditingQuestion(q);
    setForm({
      type: q.type || 'choice',
      difficulty: q.difficulty || 'medium',
      question: q.question || '',
      options: q.options && q.options.length
        ? q.options.map((o, i) => ({
            label: ['A', 'B', 'C', 'D'][i] || String(i + 1),
            text: typeof o === 'object' ? o.text || o.label || '' : String(o),
          }))
        : [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' },
          ],
      answer: q.answer || '',
      explanation: q.explanation || '',
      tags: Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || ''),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setForm({ ...EMPTY_FORM });
    setErr('');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, text) => {
    setForm((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], text };
      return { ...prev, options: newOptions };
    });
  };

  const handleSave = async () => {
    if (!form.question.trim()) {
      setErr('请填写题目内容');
      return;
    }
    if (form.type === 'choice') {
      const filledOptions = form.options.filter((o) => o.text.trim());
      if (filledOptions.length < 2) {
        setErr('选择题至少需要 2 个选项');
        return;
      }
    }
    if (!form.answer.trim()) {
      setErr('请填写正确答案');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      const payload = {
        type: form.type,
        difficulty: form.difficulty,
        question: form.question.trim(),
        answer: form.answer.trim(),
        explanation: form.explanation.trim(),
        tags: form.tags
          ? form.tags
              .split(/[,，]/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      if (form.type === 'choice') {
        payload.options = form.options
          .filter((o) => o.text.trim())
          .map((o) => ({ label: o.label, text: o.text.trim() }));
      }

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion._id || editingQuestion.id, payload);
      } else {
        await questionsAPI.create(payload);
      }
      closeForm();
      fetchQuestions();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- 删除 ---------- */
  const handleDelete = async (q) => {
    if (!window.confirm(`确定删除该题目吗？\n"${q.question.slice(0, 40)}..."`)) return;
    try {
      await questionsAPI.remove(q._id || q.id);
      fetchQuestions();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '删除失败');
    }
  };

  /* ---------- 批量导入 ---------- */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setErr('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await questionsAPI.importExcel(formData);
      const data = res.data || res;
      setImportResult(data);
      fetchQuestions();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '导入失败');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ---------- 下载模板 ---------- */
  const handleDownloadTemplate = async () => {
    try {
      const res = await questionsAPI.downloadTemplate();
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '题目导入模板.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '下载模板失败');
    }
  };

  /* ---------- 分页 ---------- */
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ---------- 渲染 ---------- */
  return (
    <div className="page">
      {/* 顶部操作栏 */}
      <div className="card">
        <div className="card-head">
          <span>题库管理</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={openCreateForm}>
              添加题目
            </button>
            <button className="btn ghost" onClick={handleDownloadTemplate}>
              下载模板
            </button>
            <button className="btn ghost" onClick={handleImportClick} disabled={importing}>
              {importing ? '导入中...' : '批量导入'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* 导入结果提示 */}
        {importResult && (
          <div
            style={{
              padding: '10px 14px',
              background: '#d4f5e9',
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
              color: '#099268',
            }}
          >
            导入完成：成功 {importResult.success ?? 0} 条，失败 {importResult.error ?? 0} 条
            {importResult.errors?.length > 0 && (
              <div style={{ marginTop: 4, fontSize: 12, color: '#e67700' }}>
                错误详情：{importResult.errors.join('；')}
              </div>
            )}
          </div>
        )}

        {/* 筛选栏 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 12, color: '#868e96', marginRight: 6 }}>难度：</span>
            <div className="pills" style={{ display: 'inline-flex' }}>
              {DIFFICULTY_OPTIONS.map((d) => (
                <span
                  key={d.key}
                  className={`pill${filterDifficulty === d.key ? ' active' : ''}`}
                  onClick={() => { setFilterDifficulty(d.key); setPage(1); }}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#868e96', marginRight: 6 }}>类型：</span>
            <div className="pills" style={{ display: 'inline-flex' }}>
              {TYPE_OPTIONS.map((t) => (
                <span
                  key={t.key}
                  className={`pill${filterType === t.key ? ' active' : ''}`}
                  onClick={() => { setFilterType(t.key); setPage(1); }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              className="input"
              placeholder="搜索题目关键词..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: '100%' }}
            />
          </div>
          <button className="btn ghost" onClick={handleSearch}>
            搜索
          </button>
        </div>

        {err && (
          <div style={{ color: '#e03131', marginBottom: 12, fontSize: 14 }}>{err}</div>
        )}

        {/* 题目列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#868e96' }}>加载中...</div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>暂无题目</p>
            <span>点击"添加题目"或"批量导入"来添加题目</span>
          </div>
        ) : (
          <div>
            {/* 表头 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 70px 70px 1fr 80px 120px',
                gap: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#868e96',
                borderBottom: '2px solid #e9ecef',
              }}
            >
              <span>#</span>
              <span>类型</span>
              <span>难度</span>
              <span>题目</span>
              <span>答案</span>
              <span>操作</span>
            </div>

            {/* 题目行 */}
            {questions.map((q, idx) => (
              <div
                key={q._id || q.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 70px 70px 1fr 80px 120px',
                  gap: 8,
                  padding: '10px 12px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f3f5',
                  fontSize: 14,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: '#868e96', fontSize: 13 }}>
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: q.type === 'choice' ? '#e0e7ff' : '#fff3bf',
                      color: q.type === 'choice' ? '#3f51b5' : '#e67700',
                    }}
                  >
                    {q.type === 'choice' ? '选择题' : '填空题'}
                  </span>
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: DIFFICULTY_COLOR[q.difficulty] || '#e9ecef',
                      color: DIFFICULTY_TEXT_COLOR[q.difficulty] || '#555',
                    }}
                  >
                    {DIFFICULTY_LABEL[q.difficulty] || q.difficulty || '-'}
                  </span>
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#333',
                  }}
                  title={q.question}
                >
                  {q.question}
                </span>
                <span style={{ fontWeight: 600, color: '#667eea' }}>{q.answer}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn ghost"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => openEditForm(q)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '4px 10px', fontSize: 12, background: '#ff6b6b', color: '#fff' }}
                    onClick={() => handleDelete(q)}
                  >
                    删除
                  </button>
                </span>
              </div>
            ))}

            {/* 分页 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
              <button
                className="btn ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              <span style={{ fontSize: 14, color: '#666' }}>
                第 {page} / {pages} 页（共 {total} 条）
              </span>
              <button
                className="btn ghost"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- 创建/编辑弹窗 ---------- */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeForm}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: 640,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              <span>{editingQuestion ? '编辑题目' : '添加题目'}</span>
              <button
                className="btn ghost"
                onClick={closeForm}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                关闭
              </button>
            </div>

            {/* 类型 & 难度 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                  题目类型
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="choice">选择题</option>
                  <option value="fill">填空题</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                  难度
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>

            {/* 题目文本 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                题目内容 *
              </label>
              <textarea
                value={form.question}
                onChange={(e) => handleFormChange('question', e.target.value)}
                placeholder="请输入题目内容..."
                rows={3}
              />
            </div>

            {/* 选择题选项 */}
            {form.type === 'choice' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                  选项
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {form.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#e0e7ff',
                          color: '#3f51b5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {opt.label}
                      </span>
                      <input
                        className="input"
                        placeholder={`选项 ${opt.label}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(oi, e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 正确答案 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                正确答案 *
              </label>
              <input
                className="input"
                placeholder={form.type === 'choice' ? '例如：A' : '请输入正确答案'}
                value={form.answer}
                onChange={(e) => handleFormChange('answer', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* 解析 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                解析
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => handleFormChange('explanation', e.target.value)}
                placeholder="请输入题目解析（可选）..."
                rows={2}
              />
            </div>

            {/* 标签 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>
                标签
              </label>
              <input
                className="input"
                placeholder="多个标签用逗号分隔，例如：语法,词汇"
                value={form.tags}
                onChange={(e) => handleFormChange('tags', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* 表单内错误 */}
            {err && (
              <div style={{ color: '#e03131', marginBottom: 12, fontSize: 14 }}>{err}</div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn ghost" onClick={closeForm}>
                取消
              </button>
              <button className="btn primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
