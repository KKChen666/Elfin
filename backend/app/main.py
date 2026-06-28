from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
Base.metadata.create_all(bind=engine)

app = FastAPI(title="亲友管理 API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
