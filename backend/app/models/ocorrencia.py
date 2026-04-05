from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cpf_cidadao: Mapped[str] = mapped_column(String(11), nullable=False, index=True)
    categoria_id: Mapped[int] = mapped_column(Integer, ForeignKey("categorias.id"), nullable=False)
    prioridade_id: Mapped[int] = mapped_column(Integer, ForeignKey("prioridades.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Aberta")
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    data_abertura: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    data_encerramento: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    categoria = relationship("Categoria", lazy="joined")
    prioridade = relationship("Prioridade", lazy="joined")
    historicos = relationship("Historico", back_populates="ocorrencia", order_by="Historico.data_alteracao")
