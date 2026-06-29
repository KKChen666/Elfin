import os
from pathlib import Path

import uvicorn


BASE_DIR = Path(__file__).resolve().parent


def main() -> None:
    os.chdir(BASE_DIR)

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "3290"))
    reload = os.getenv("RELOAD", "true").lower() in {"1", "true", "yes", "on"}

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[str(BASE_DIR / "app")] if reload else None,
    )


if __name__ == "__main__":
    main()
