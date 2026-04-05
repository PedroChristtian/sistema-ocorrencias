from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Historico(Base):
    __tablename__ = "historicos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ocorrencia_id: Mapped[int] = mapped_column(Integer, ForeignKey("ocorrencias.id"), nullable=False, index=True)
    status_anterior: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status_novo: Mapped[str] = mapped_column(String(20), nullable=False)
    data_alteracao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    ocorrencia = relationship("Ocorrencia", back_populates="historicos")
