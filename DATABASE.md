# AI实时翻译学习平台 - 数据库文档

## 数据库概述

- **数据库类型**: MongoDB
- **数据库名称**: ai-virtual (默认)
- **连接方式**: 通过环境变量 `MONGO_URI` 配置

---

## 数据表（集合）清单

### 1. users - 用户表
存储平台所有用户信息（学生和教师）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 用户唯一标识 |
| name | String | 用户姓名 |
| email | String | 邮箱（登录账号） |
| password | String | 加密后的密码 |
| role | String | 角色：'student' 或 'teacher' |
| avatar | String | 头像URL（可选） |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**用途**: 
- 用户注册/登录
- 区分学生和教师权限
- 关联班级、作业、提交等数据

---

### 2. classes - 班级表
存储班级信息

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 班级唯一标识 |
| name | String | 班级名称 |
| subject | String | 学科 |
| period | String | 学期/周期 |
| teacher | ObjectId | 教师ID（关联users表） |
| members | Array | 学生ID列表 |
| inviteCode | String | 邀请码 |
| inviteExpires | Date | 邀请码过期时间 |
| inviteLimit | Number | 邀请码使用次数限制 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**用途**:
- 教师创建/管理班级
- 学生通过邀请码加入班级
- 班级成员管理

---

### 3. assignments - 作业表
存储教师布置的作业

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 作业唯一标识 |
| title | String | 作业标题 |
| class | ObjectId | 所属班级ID |
| type | String | 类型：translate/interpret/read |
| direction | String | 翻译方向：zh-en/en-zh |
| sourceText | String | 原文内容 |
| dueDate | Date | 截止日期 |
| totalScore | Number | 总分 |
| createdBy | ObjectId | 创建者（教师）ID |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**用途**:
- 教师布置作业
- 学生查看作业列表
- 关联提交记录

---

### 4. submissions - 提交表
存储学生提交的作业

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 提交唯一标识 |
| assignment | ObjectId | 作业ID |
| student | ObjectId | 学生ID |
| answerText | String | 学生答案（文本） |
| audioUrl | String | 音频文件URL（口译作业） |
| score | Number | 得分（教师批改后） |
| feedback | String | 教师评语 |
| aiScore | Number | AI初评分 |
| aiFeedback | String | AI评语 |
| status | String | 状态：submitted/graded |
| submittedAt | Date | 提交时间 |
| gradedAt | Date | 批改时间 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**用途**:
- 学生提交作业
- 教师批改评分
- AI自动初评
- 统计完成率、平均分

---

### 5. terms - 术语表
存储翻译专业术语

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 术语唯一标识 |
| term | String | 术语名称（英文） |
| meaning | String | 释义（中文） |
| cat | String | 分类 |
| icon | String | 图标emoji |
| difficulty | String | 难度：beginner/intermediate/advanced |
| gradient | Object | 渐变色彩 {from, to} |
| createdBy | ObjectId | 创建者ID |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**分类示例**: 翻译技术、语言学基础、翻译工具、翻译方法、翻译实践、口译、视听翻译

---

### 6. cases - 案例表
存储翻译案例

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 案例唯一标识 |
| title | String | 案例标题 |
| domain | String | 领域/分类 |
| summary | String | 摘要 |
| content | String | 详细内容（Markdown） |
| tags | Array | 标签列表 |
| coverImage | String | 封面图标emoji |
| difficulty | String | 难度 |
| estimatedTime | String | 预计学习时间 |
| gradient | Object | 渐变色彩 {from, to} |
| createdBy | ObjectId | 创建者ID |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**领域示例**: 科技翻译、商务翻译、口译、游戏本地化、法律翻译

---

### 7. chats - 对话记录表（可选）
存储AI对话历史

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | ObjectId | 记录唯一标识 |
| user | ObjectId | 用户ID |
| role | String | 角色：user/assistant |
| content | String | 对话内容 |
| createdAt | Date | 创建时间 |

---

## 数据关系图

```
users ──────┬────── classes (教师创建班级)
            ├────── classes.members (学生加入班级)
            ├────── assignments (教师布置作业)
            ├────── submissions (学生提交作业)
            ├────── terms (创建术语)
            └────── cases (创建案例)

classes ────┬────── users (教师)
            ├────── users (学生成员)
            └────── assignments (班级作业)

assignments ┬────── classes (所属班级)
            ├────── users (创建者)
            └────── submissions (作业提交)

submissions ├────── assignments (对应作业)
            └────── users (提交学生)
```

---

## 常用查询示例

### 1. 查询某班级的所有作业
```javascript
db.assignments.find({ class: ObjectId("班级ID") })
```

### 2. 查询某作业的所有提交
```javascript
db.submissions.find({ assignment: ObjectId("作业ID") })
```

### 3. 查询某学生的所有提交
```javascript
db.submissions.find({ student: ObjectId("学生ID") })
```

### 4. 查询某班级的统计数据
```javascript
// 班级信息
const cls = db.classes.findOne({ _id: ObjectId("班级ID") });
const membersCount = cls.members.length;

// 作业数
const assignmentsCount = db.assignments.countDocuments({ class: cls._id });

// 已提交数
const submittedCount = db.submissions.countDocuments({ 
  assignment: { $in: db.assignments.find({ class: cls._id }).toArray().map(a => a._id) }
});

// 完成率
const completionRate = (membersCount * assignmentsCount) > 0 
  ? submittedCount / (membersCount * assignmentsCount) 
  : 0;
```

### 5. 按分类查询术语
```javascript
db.terms.find({ cat: "翻译技术" })
```

### 6. 查询某教师的所有班级
```javascript
db.classes.find({ teacher: ObjectId("教师ID") })
```

### 7. 查询未批改的提交
```javascript
db.submissions.find({ score: null, status: "submitted" })
```

### 8. 聚合统计平均分
```javascript
db.submissions.aggregate([
  { $match: { score: { $ne: null } } },
  { $group: { _id: null, avgScore: { $avg: "$score" } } }
])
```

---

## 索引说明

建议在以下字段上创建索引以提高查询性能：

```javascript
// users 表
db.users.createIndex({ email: 1 }, { unique: true })

// classes 表
db.classes.createIndex({ teacher: 1 })
db.classes.createIndex({ members: 1 })
db.classes.createIndex({ inviteCode: 1 }, { unique: true })

// assignments 表
db.assignments.createIndex({ class: 1 })
db.assignments.createIndex({ createdBy: 1 })

// submissions 表
db.submissions.createIndex({ assignment: 1 })
db.submissions.createIndex({ student: 1 })
db.submissions.createIndex({ assignment: 1, student: 1 }, { unique: true })

// terms 表
db.terms.createIndex({ term: 1 })
db.terms.createIndex({ cat: 1 })

// cases 表
db.cases.createIndex({ title: "text", summary: "text", content: "text" })
db.cases.createIndex({ domain: 1 })
```
