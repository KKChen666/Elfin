import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


_FERNET_PREFIX = "gAAAA"


def _fernet() -> Fernet:
    digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_secret(value: str | None) -> str | None:
    if not value:
        return None
    return _fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str | None) -> str | None:
    if not value:
        return None
    if not value.startswith(_FERNET_PREFIX):
        return value
    try:
        return _fernet().decrypt(value.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        return None


def is_encrypted_secret(value: str | None) -> bool:
    return bool(value and value.startswith(_FERNET_PREFIX))


def mask_secret(value: str | None) -> str | None:
    secret = decrypt_secret(value)
    if not secret:
        return None
    if len(secret) <= 8:
        return "*" * len(secret)
    return f"{secret[:4]}...{secret[-4:]}"
