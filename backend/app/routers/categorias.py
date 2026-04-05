from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse, CategoriaUpdate
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/categorias", tags=["Categorias"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[CategoriaResponse])
def listar(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nome).all()


@router.get("/{id}", response_model=CategoriaResponse)
def obter(id: int, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada")
    return cat


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar(data: CategoriaCreate, db: Session = Depends(get_db)):
    existing = db.query(Categoria).filter(Categoria.nome == data.nome).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Categoria ja existe")
    cat = Categoria(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{id}", response_model=CategoriaResponse)
def atualizar(id: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada")
    db.delete(cat)
    db.commit()
