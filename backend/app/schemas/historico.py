from datetime import datetime

from pydantic import BaseModel


class HistoricoResponse(BaseModel):
    id: int
    ocorrencia_id: int
    status_anterior: str | None
    status_novo: str
    data_alteracao: datetime

    model_config = {"from_attributes": True}
