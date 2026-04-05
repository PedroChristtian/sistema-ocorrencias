from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.database import Base, engine
from app.models import categoria, historico, ocorrencia, prioridade, usuario  # noqa: F401
from app.routers import auth, categorias, ocorrencias, prioridades


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Sistema de Ocorrencias Municipais", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(categorias.router, prefix="/api")
app.include_router(prioridades.router, prefix="/api")
app.include_router(ocorrencias.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
