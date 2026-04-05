from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    senha: str = Field(..., min_length=6, max_length=128)


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str

    model_config = {"from_attributes": True}
