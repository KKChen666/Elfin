import uuid
from io import BytesIO

from qcloud_cos import CosConfig, CosS3Client

from app.config import settings


def get_cos_client() -> CosS3Client:
    if not (
        settings.COS_SECRET_ID
        and settings.COS_SECRET_KEY
        and settings.COS_BUCKET
        and settings.COS_REGION
    ):
        raise ValueError("COS storage is not configured")

    config = CosConfig(
        Region=settings.COS_REGION,
        SecretId=settings.COS_SECRET_ID,
        SecretKey=settings.COS_SECRET_KEY,
    )
    return CosS3Client(config)


def upload_avatar(file_bytes: bytes, filename: str) -> str:
    """
    上传头像图片到腾讯云 COS
    返回图片的访问 URL
    """
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "png"
    key = f"avatars/{uuid.uuid4().hex}.{ext}"

    client = get_cos_client()
    client.put_object(
        Bucket=settings.COS_BUCKET,
        Body=BytesIO(file_bytes),
        Key=key,
        ContentType=f"image/{ext}",
    )

    url = f"https://{settings.COS_BUCKET}.cos.{settings.COS_REGION}.myqcloud.com/{key}"
    return url
