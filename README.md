# Elfin

Elfin 是一个面向个人关系管理的 AI 工作台，核心目标是把“亲友资料、关系网、重要日子、聊天记忆、AI Agent 对话”放到同一个系统里。

它不是普通通讯录，也不是单纯聊天机器人。当前主线是：

- 记录亲友资料和偏好
- 建立亲友之间的关系网，而不是只以用户为中心
- 导入聊天记录，提取说话风格和可检索记忆
- 用 Skill / Agent 复用这些表达习惯
- 在类 ChatGPT / Qwen / 豆包的聊天界面里与 Agent 对话
- 管理生日、节日和自定义提醒

## 技术栈

### 后端

- FastAPI
- SQLAlchemy 2.x
- MySQL / PyMySQL
- Alembic
- JWT / python-jose
- 腾讯云 COS
- 可选 Alibaba Zvec 向量索引

### 前端

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- axios
- Phosphor Icons

## 项目结构

```text
Elfin/
├─ backend/                 # FastAPI 后端
│  ├─ alembic/              # 数据库迁移
│  ├─ app/
│  │  ├─ models/            # SQLAlchemy 模型
│  │  ├─ routers/           # API 路由
│  │  ├─ schemas/           # Pydantic schema
│  │  ├─ services/          # 业务服务
│  │  └─ utils/             # 认证、加密等工具
│  ├─ .env.example
│  └─ requirements.txt
├─ frontend/                # React 前端
│  └─ src/
│     ├─ api/               # API 客户端
│     ├─ components/        # 通用组件
│     ├─ pages/             # 页面
│     ├─ stores/            # Zustand 状态
│     ├─ types/             # 前端类型
│     └─ utils/             # 日期、农历等工具
├─ docs/                    # 设计文档和资料
└─ android/                 # Capacitor Android 项目
```

## 快速启动

### 后端

```powershell
cd D:\code\Elfin\backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
python run.py
```

默认后端地址：

- API: `http://localhost:3290`
- Swagger: `http://localhost:3290/docs`

也可以直接运行：

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3290
```

### 前端

```powershell
cd D:\code\Elfin\frontend
npm install
npm run dev
```

默认前端地址：

```text
http://localhost:2901
```

开发模式下，`frontend/vite.config.ts` 会把 `/api` 代理到 `http://127.0.0.1:3290`。

## 后端配置

复制 `backend/.env.example` 为 `backend/.env` 后配置：

```env
# App
APP_ENV=development
AUTO_CREATE_TABLES=true

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elfin

# JWT
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Tencent COS
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your_bucket_name
COS_REGION=ap-guangzhou

# LLM defaults
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
LLM_TIMEOUT=60

# Memory vector backend
MEMORY_VECTOR_BACKEND=sql
ZVEC_MEMORY_PATH=./storage/zvec_memory
```

说明：

- `AUTO_CREATE_TABLES=true` 适合本地开发，会在启动时自动创建表并做少量兼容字段补齐。
- 生产或长期使用建议改成 `AUTO_CREATE_TABLES=false`，改用 Alembic 迁移。
- `MEMORY_VECTOR_BACKEND=sql` 使用内置 JSON 向量兜底检索。
- `MEMORY_VECTOR_BACKEND=zvec` 启用 Alibaba Zvec 本地向量索引。
- 用户自己的 LLM API Key 会通过前端“模型设置”保存，并在后端加密存储。

## 数据库迁移

项目已经接入 Alembic：

```powershell
cd D:\code\Elfin\backend
.\.venv\Scripts\activate
alembic upgrade head
```

如果你已经有一套由 `AUTO_CREATE_TABLES=true` 创建出来的旧库，不要直接跑基线迁移创建全表。先标记当前库已经处于基线：

```powershell
alembic stamp 20260701_0001
```

之后新增字段或新表时，再创建新的 revision 并执行：

```powershell
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

当前基线迁移：

```text
backend/alembic/versions/20260701_0001_baseline.py
```

## 核心功能

### 亲友资料

- 添加、编辑、删除亲友
- 记录生日、公历/农历、关系、电话、兴趣、尺码、MBTI、地址、备注
- 头像支持自定义 Q 版头像和 COS 图片上传
- 自动计算星座、生肖和生日倒计时

### 关系网

关系网位于 `/network`。

- 支持亲友之间建立关系
- 支持关系称呼和反向称呼
- 支持亲密度和备注
- 支持编辑、删除关系
- 支持全局视角和任意亲友视角切换

### 提醒和日历

提醒位于 `/reminders`，日历位于 `/calendar`。

- 生日会自动进入提醒和日历
- 母亲节、父亲节会根据亲友关系自动生成
- 支持自定义提醒
- 自定义提醒可关联亲友
- 日历会展示自动事件和自定义事件

### 聊天导入和记忆库

聊天导入位于 `/import/:id`。

- 支持上传 `.txt` / `.csv` 聊天记录
- 后端解析聊天内容并提取表达风格
- 生成 `ChatStyle`
- 生成可检索的 `ChatMemoryChunk`
- 导入完成后显示记忆片段数量
- 显示当前记忆后端状态：`SQL` 或 `ZVEC`

当前记忆链路：

```text
聊天记录
→ parse_chat_file
→ analyze_chat_style
→ rebuild_memory_chunks
→ SQL 存储真实记忆片段
→ SQL/Zvec 做相似检索
→ generate_avatar_response 使用命中记忆生成回复
```

### Zvec 向量索引

项目已经接入 Alibaba Zvec 作为可选本地向量索引。

默认仍使用 SQL 兜底：

```env
MEMORY_VECTOR_BACKEND=sql
```

启用 Zvec：

```env
MEMORY_VECTOR_BACKEND=zvec
ZVEC_MEMORY_PATH=./storage/zvec_memory
```

注意：

- SQL 仍是业务数据和记忆片段的真实来源。
- Zvec 只作为向量索引层。
- 如果 Zvec 未安装或打开失败，会自动回退到 SQL 检索。
- 当前 embedding 是项目内置轻量 hash 向量，不是真正语义 embedding。后续可以接 BGE / Qwen / OpenAI embedding。

### Skill 和 Agent

- 可以手动创建 Skill
- 可以从亲友聊天风格蒸馏 Skill
- 可以合并多个 Skill
- 可以创建 Agent，并关联 Skill
- Agent 支持单聊和群聊
- 群聊会根据 @提及、关键词或 LLM 路由选择回复者

### AI 对话

主对话位于 `/chat`。

- 类 ChatGPT / Qwen / 豆包布局
- 支持创建单 Agent 或多 Agent 对话
- 支持流式回复
- 支持停止生成
- 支持重新生成
- 支持复制消息
- 支持归档、恢复、软删除对话
- 未配置 API Key 时会使用 mock 回复，并在前端提示

## 常用 API

### 认证

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/register` | 注册 |
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/auth/me` | 当前用户 |
| `GET` | `/api/auth/llm-settings` | 获取模型设置 |
| `PUT` | `/api/auth/llm-settings` | 更新模型设置 |

### 亲友和关系网

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/relatives` | 亲友列表 |
| `POST` | `/api/relatives` | 创建亲友 |
| `GET` | `/api/relatives/{id}` | 亲友详情 |
| `PUT` | `/api/relatives/{id}` | 更新亲友 |
| `DELETE` | `/api/relatives/{id}` | 删除亲友 |
| `GET` | `/api/relatives/relationships/network` | 关系网 |
| `POST` | `/api/relatives/relationships/network` | 新增或更新两人关系 |
| `PUT` | `/api/relatives/relationships/network/{id}` | 编辑关系 |
| `DELETE` | `/api/relatives/relationships/network/{id}` | 删除关系 |

### 提醒

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/reminders` | 自定义提醒列表 |
| `POST` | `/api/reminders` | 创建提醒 |
| `PUT` | `/api/reminders/{id}` | 更新提醒 |
| `DELETE` | `/api/reminders/{id}` | 删除提醒 |

### 聊天风格和记忆

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/relatives/{id}/messages` | 获取亲友聊天消息 |
| `POST` | `/api/relatives/{id}/messages` | 新增聊天消息 |
| `DELETE` | `/api/relatives/{id}/messages` | 清空聊天消息 |
| `POST` | `/api/relatives/{id}/messages/respond` | 生成分身回复 |
| `POST` | `/api/relatives/{id}/chat-style/upload` | 上传聊天记录并分析 |
| `GET` | `/api/relatives/{id}/chat-style` | 获取聊天风格 |
| `GET` | `/api/relatives/{id}/chat-style/memory-backend` | 获取记忆后端状态 |

### Skill / Agent / Conversation

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/skills` | Skill 列表 |
| `POST` | `/api/skills` | 创建 Skill |
| `POST` | `/api/skills/creator` | 从文本/文件创建 Skill |
| `POST` | `/api/skills/distill/{relative_id}` | 从亲友风格蒸馏 Skill |
| `POST` | `/api/skills/merge` | 合并 Skill |
| `GET` | `/api/agents` | Agent 列表 |
| `POST` | `/api/agents` | 创建 Agent |
| `POST` | `/api/conversations` | 创建对话 |
| `GET` | `/api/conversations` | 对话列表 |
| `POST` | `/api/conversations/{id}/messages` | 发送消息 |
| `POST` | `/api/conversations/{id}/messages/agent` | 触发 Agent 流式回复 |

完整接口见 Swagger：

```text
http://localhost:3290/docs
```

## 验证命令

后端：

```powershell
cd D:\code\Elfin\backend
.\.venv\Scripts\python.exe -m compileall app
```

前端：

```powershell
cd D:\code\Elfin\frontend
npm run check
npm run lint
npm run build
```

当前 build 可能出现 Vite chunk 体积超过 500KB 的提示，这是性能优化提示，不是构建失败。后续可以通过路由懒加载和手动分包优化。

## 后续建议

- 给主要页面做路由级 lazy load，降低首包体积
- 接入真正语义 embedding 模型，替换当前轻量 hash embedding
- 给提醒增加重复规则和通知渠道
- 给关系网增加筛选、搜索和布局拖拽
- 给聊天导入增加更多聊天记录格式解析器
- 把启动时兼容字段补丁逐步迁移到 Alembic revision
