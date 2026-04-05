from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.prioridade import Prioridade
from app.schemas.prioridade import PrioridadeCreate, PrioridadeResponse, PrioridadeUpdate
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/prioridades", tags=["Prioridades"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[PrioridadeResponse])
def listar(db: Session = Depends(get_db)):
    return db.query(Prioridade).order_by(Prioridade.nivel).all()


@router.get("/{id}", response_model=PrioridadeResponse)
def obter(id: int, db: Session = Depends(get_db)):
    pri = db.query(Prioridade).filter(Prioridade.id == id).first()
    if not pri:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prioridade nao encontrada")
    return pri


@router.post("/", response_model=PrioridadeResponse, status_code=status.HTTP_201_CREATED)
def criar(data: PrioridadeCreate, db: Session = Depends(get_db)):
    existing = db.query(Prioridade).filter(Prioridade.nome == data.nome).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Prioridade ja existe")
    pri = Prioridade(**data.model_dump())
    db.add(pri)
    db.commit()
    db.refresh(pri)
    return pri


@router.put("/{id}", response_model=PrioridadeResponse)
def atualizar(id: int, data: PrioridadeUpdate, db: Session = Depends(get_db)):
    pri = db.query(Prioridade).filter(Prioridade.id == id).first()
    if not pri:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prioridade nao encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pri, key, value)
    db.commit()
    db.refresh(pri)
    return pri


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, db: Session = Depends(get_db)):
    pri = db.query(Prioridade).filter(Prioridade.id == id).first()
    if not pri:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prioridade nao encontrada")
    db.delete(pri)
    db.commit()
