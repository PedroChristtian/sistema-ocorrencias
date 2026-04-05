from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    descricao: str | None = Field(None, max_length=255)


class CategoriaUpdate(BaseModel):
    nome: str | None = Field(None, min_length=1, max_length=100)
    descricao: str | None = Field(None, max_length=255)


class CategoriaResponse(BaseModel):
    id: int
    nome: str
    descricao: str | None

    model_config = {"from_attributes": True}
