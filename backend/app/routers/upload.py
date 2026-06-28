from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.relative import Relative
from app.schemas.relative import RelativeOut
from app.services.cos_service import upload_avatar
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/relatives", tags=["头像上传"])


@router.post("/{relative_id}/avatar-image", response_model=RelativeOut)
async def upload_avatar_image(
    relative_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传头像图片到腾讯云 COS"""
    relative = (
        db.query(Relative)
        .filter(Relative.id == relative_id, Relative.user_id == user.id)
        .first()
    )
    if not relative:
        raise HTTPException(status_code=404, detail="亲友不存在")

    # 验证文件类型
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="请上传图片文件")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB 限制
        raise HTTPException(status_code=400, detail="图片大小不能超过 5MB")

    url = upload_avatar(content, file.filename or "avatar.png")
    relative.avatar_image_url = url
    db.commit()
    db.refresh(relative)

    return RelativeOut.model_validate(relative)
