from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import settings
from app.database import engine, Base
# 导入所有模型以确保关系正确解析
from app.models import user, relative, chat_message
from app.models import skill, agent, conversation
from app.routers import auth, relatives, upload
from app.routers.chat import router as chat_router, chat_style_router
from app.routers import skills as skills_router
from app.routers import agents as agents_router
from app.routers import conversations as conversations_router

# 创建数据库表
if settings.AUTO_CREATE_TABLES:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        columns = {column["name"] for column in inspect(conn).get_columns("conversations")}
        if "is_archived" not in columns:
            conn.execute(text("ALTER TABLE conversations ADD COLUMN is_archived BOOL NOT NULL DEFAULT 0"))
        if "archived_at" not in columns:
            conn.execute(text("ALTER TABLE conversations ADD COLUMN archived_at DATETIME NULL"))
        user_column_info = inspect(conn).get_columns("users")
        user_columns = {column["name"] for column in user_column_info}
        if "llm_api_key" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN llm_api_key TEXT NULL"))
        else:
            api_key_column = next(
                column for column in user_column_info if column["name"] == "llm_api_key"
            )
            if "TEXT" not in str(api_key_column["type"]).upper():
                conn.execute(text("ALTER TABLE users MODIFY COLUMN llm_api_key TEXT NULL"))
        if "llm_api_base" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN llm_api_base VARCHAR(500) NULL"))
        if "llm_model" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN llm_model VARCHAR(100) NULL"))
        if "llm_timeout" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN llm_timeout INT NULL"))

app = FastAPI(title="亲友管理 API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:2901", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(relatives.router)
app.include_router(upload.router)
app.include_router(chat_router)
app.include_router(chat_style_router)
app.include_router(skills_router.router)
app.include_router(agents_router.router)
app.include_router(conversations_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
