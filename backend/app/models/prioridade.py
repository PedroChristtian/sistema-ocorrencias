from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Prioridade(Base):
    __tablename__ = "prioridades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nivel: Mapped[int] = mapped_column(Integer, nullable=False)
