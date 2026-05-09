import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classesAPI from '../../services/classes';
import assignmentsAPI from '../../services/assignments';
import './Student.css';

const STATUS_LABELS = {
  all: '全部',
  pending: '待完成',
  in_progress: '进行中',
  submitted: '已提交',
  graded: '已批改',
};

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

export default function StudentClassDetail() {
  const { id } = useParams(); // classId
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await classesAPI.detail(id);
        setInfo(res.data || res);
      } catch (e) {
        setErr(e?.response?.data?.error || e?.message || '获取班级详情失败');
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await classesAPI.studentDashboard(id);
        setDashboard(res.data || res);
      } catch (e) {
        // dashboard is optional, don't set error
      }
    })();
  }, [id]);

  const fetchAssignments = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await assignmentsAPI.listForClass(id, { page, pageSize });
      const data = res.data || res;
      setList(data.list || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '获取作业列表失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); /* eslint-disable-next-line */ }, [id, page, pageSize]);

  const filtered = useMemo(() => {
    if (status === 'all') return list;
    return (list || []).filter(x => (x.status || 'pending') === status);
  }, [list, status]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  const onLeave = async () => {
    if (!window.confirm('确定要退出该班级吗？')) return;
    try {
      await classesAPI.leaveClass(id);
      navigate('/student/classes');
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || '退出班级失败');
    }
  };

  // Sort announcements: pinned first, then by createdAt desc
  const announcements = useMemo(() => {
    if (!info?.announcements) return [];
    const sorted = [...info.announcements].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return sorted;
  }, [info?.announcements]);

  return (
    <div className="page">
      <div className="card">
        <div className="card-head" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>班级详情</span>
          <button
            className="btn"
            style={{ color:'#e03131', borderColor:'#e03131', fontSize:13 }}
            onClick={onLeave}
          >
            退出班级
          </button>
        </div>
        {info ? (
          <div style={{ marginBottom: 12 }}>
            <div><b>{info.name}</b>（{info.subject || '未知学科'}） · 人数：{info.membersCount ?? '-'}</div>
            {info.latestAssignment && (
              <div style={{ color:'#555' }}>最新作业：{info.latestAssignment.title}</div>
            )}
          </div>
        ) : (
          <div>加载中…</div>
        )}

        {/* Student Dashboard Stats */}
        {dashboard && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            marginBottom: 16,
            padding: '12px 16px',
            background: '#f8f9fa',
            borderRadius: 8,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#495057' }}>{dashboard.totalAssignments ?? 0}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>总作业数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#228be6' }}>{dashboard.submittedCount ?? 0}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>已提交</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#40c057' }}>{dashboard.gradedCount ?? 0}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>已批改</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#f59f00' }}>{dashboard.averageScore != null ? dashboard.averageScore : '-'}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>平均分</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#7950f2' }}>{dashboard.completionRate != null ? `${(dashboard.completionRate * 100).toFixed(0)}%` : '-'}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>完成率</div>
            </div>
          </div>
        )}

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: '#495057' }}>班级公告</div>
            {announcements.map((ann, idx) => (
              <div key={idx} style={{
                padding: '10px 14px',
                marginBottom: 8,
                background: ann.pinned ? '#fff9db' : '#f8f9fa',
                borderRadius: 6,
                borderLeft: ann.pinned ? '3px solid #f59f00' : '3px solid #dee2e6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {ann.pinned && <span style={{ fontSize: 14 }}>&#x1F4CC;</span>}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{ann.title}</span>
                  <span style={{ fontSize: 12, color: '#adb5bd', marginLeft: 'auto' }}>{relativeTime(ann.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, color: '#495057', lineHeight: 1.5 }}>{ann.content}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <button key={k} className={`btn ${status===k?'primary':''}`} onClick={()=>{ setStatus(k); setPage(1); }}>{v}</button>
          ))}
        </div>

        {err && <div className="note" style={{ color:'#e03131', marginBottom:8 }}>{err}</div>}

        {loading ? <div>加载中…</div> : (
          <div>
            {(filtered || []).length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'#868e96'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>&#x1F4ED;</div>
                <p>没有符合筛选条件的作业</p>
              </div>
            ) : (
              (filtered || []).map(item => (
                <div key={item._id} className="card" style={{ marginBottom:8 }}>
                  <div className="card-head">
                    <span>{item.title}</span>
                    <span style={{ fontSize:12, color:'#666' }}>类型：{item.type}</span>
                  </div>
                  <div>状态：{STATUS_LABELS[item.status] || '待完成'}</div>
                  {typeof item.myScore === 'number' && (
                    <div>我的分数：{item.myScore}</div>
                  )}
                  {item.dueAt && <div>截止：{new Date(item.dueAt).toLocaleString()}</div>}
                  <div style={{ marginTop:6 }}>
                    <a className="btn" href={`/student/assignments/${item._id}`} style={{ textDecoration:'none' }}>进入作业</a>
                  </div>
                </div>
              ))
            )}

            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>上一页</button>
              <span>第 {page} / {pages} 页</span>
              <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
