# Elfin - 亲友管理 & AI Agent 系统

一个集亲友管理、聊天风格蒸馏、AI Agent 对话于一体的个人工具应用。

## 项目结构

```
Elfin/
├── backend/          # Python FastAPI 后端
├── frontend/         # React 前端
├── docs/             # 文档和资源
└── android/          # Android 原生项目（Capacitor）
```

---

## 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Python | 3.14 | 后端运行环境 |
| Node.js | 18+ | 前端构建环境 |
| MySQL | 8.0+ | 数据库（远程） |
| npm | 9+ | 前端包管理 |

---

## 快速开始

### 后端

```bash
# 1. 进入后端目录
cd D:\code\Elfin\backend

# 2. 激活虚拟环境（已创建好）
venv\Scripts\activate

# 3. 启动服务
uvicorn app.main:app --reload --port 8000
```

**访问地址：**
- API 服务：http://localhost:8000
- Swagger 文档：http://localhost:8000/docs

**首次安装（如果 venv 丢失）：**
```bash
cd D:\code\Elfin\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 前端

```bash
# 1. 进入前端目录
cd D:\code\Elfin\frontend

# 2. 安装依赖（首次）
npm install

# 3. 启动开发服务器
npm run dev
```

**访问地址：** http://localhost:5173

---

## 配置说明

### 后端配置 (`backend/.env`)

```env
# MySQL 数据库
DB_HOST=119.45.182.166
DB_PORT=9274
DB_USER=elfin
DB_PASSWORD=your_password
DB_NAME=elfin

# JWT 认证
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 腾讯云 COS 存储
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_BUCKET=your_bucket
COS_REGION=ap-nanjing

# LLM API（Agent 对话功能需要）
LLM_API_KEY=your_api_key
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
```

### 前端配置 (`frontend/vite.config.ts`)

开发模式下自动代理 `/api` 请求到后端 `http://localhost:8000`。

---

## 技术栈

### 后端
| 技术 | 用途 |
|------|------|
| FastAPI | Web 框架 |
| SQLAlchemy | ORM |
| PyMySQL | MySQL 驱动 |
| python-jose | JWT 认证 |
| cos-python-sdk-v5 | 腾讯云 COS |
| httpx | HTTP 客户端（LLM 调用） |

### 前端
| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS | 样式 |
| Zustand | 状态管理 |
| axios | HTTP 请求 |

---

## 功能特性

### 亲友管理
- 添加、编辑、删除亲友信息
- 生日提醒、日历视图
- 统计分析

### 聊天风格蒸馏
- 导入微信/QQ 聊天记录
- NLP 分析语言风格、表达习惯
- 提取"表达DNA"和记忆树

### AI Agent 系统
- 创建智能体（Agent）
- 从聊天记录蒸馏技能（Skill）
- 单聊和群聊
- 流式响应

### 捏脸工坊
- SVG Q版头像自定义
- 真实照片上传（腾讯云 COS）

---

## 目录说明

| 目录 | 说明 |
|------|------|
| `backend/app/models/` | 数据库模型（User, Relative, Skill, Agent, Conversation） |
| `backend/app/routers/` | API 路由（auth, relatives, skills, agents, conversations） |
| `backend/app/services/` | 业务逻辑（蒸馏、LLM、COS 上传） |
| `backend/app/utils/` | 工具函数（JWT 认证） |
| `frontend/src/api/` | API 请求层 |
| `frontend/src/pages/` | 页面组件 |
| `frontend/src/stores/` | Zustand 状态管理 |
| `frontend/src/components/` | 通用组件（Layout, ClaudeLayout, Avatar） |
| `docs/` | 设计文档和资源 |

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/relatives` | 获取亲友列表 |
| POST | `/api/skills/distill/{id}` | 蒸馏技能 |
| GET | `/api/agents` | 获取 Agent 列表 |
| POST | `/api/conversations` | 创建对话 |
| POST | `/api/conversations/{id}/messages` | 发送消息 |

完整 API 文档：http://localhost:8000/docs
