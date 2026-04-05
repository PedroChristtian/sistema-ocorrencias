from pydantic import BaseModel, Field


class PrioridadeCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=50)
    nivel: int = Field(..., ge=1, le=10)


class PrioridadeUpdate(BaseModel):
    nome: str | None = Field(None, min_length=1, max_length=50)
    nivel: int | None = Field(None, ge=1, le=10)


class PrioridadeResponse(BaseModel):
    id: int
    nome: str
    nivel: int

    model_config = {"from_attributes": True}
