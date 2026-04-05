from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.categoria import CategoriaResponse
from app.schemas.prioridade import PrioridadeResponse


class OcorrenciaCreate(BaseModel):
    cpf_cidadao: str = Field(..., min_length=11, max_length=14)
    categoria_id: int
    prioridade_id: int
    descricao: str = Field(..., min_length=1, max_length=2000)


class OcorrenciaUpdate(BaseModel):
    categoria_id: int | None = None
    prioridade_id: int | None = None
    descricao: str | None = Field(None, min_length=1, max_length=2000)
    status: str | None = None


class OcorrenciaResponse(BaseModel):
    id: int
    cpf_cidadao: str
    categoria_id: int
    prioridade_id: int
    status: str
    descricao: str
    data_abertura: datetime
    data_encerramento: datetime | None
    categoria: CategoriaResponse
    prioridade: PrioridadeResponse

    model_config = {"from_attributes": True}


class OcorrenciaListResponse(BaseModel):
    items: list[OcorrenciaResponse]
    total: int
    page: int
    pages: int
