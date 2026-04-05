import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import cast, Date, func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.categoria import Categoria
from app.models.historico import Historico
from app.models.ocorrencia import Ocorrencia
from app.models.prioridade import Prioridade
from app.schemas.historico import HistoricoResponse
from app.schemas.ocorrencia import OcorrenciaCreate, OcorrenciaListResponse, OcorrenciaResponse, OcorrenciaUpdate
from app.services.auth_deps import get_current_user
from app.services.status_machine import TODOS_STATUS, validar_transicao
from app.utils.cpf import validar_cpf

router = APIRouter(prefix="/ocorrencias", tags=["Ocorrencias"], dependencies=[Depends(get_current_user)])

OPERADORES = {
    "eq": lambda col, val: col == val,
    "ne": lambda col, val: col != val,
    "gt": lambda col, val: col > val,
    "lt": lambda col, val: col < val,
    "gte": lambda col, val: col >= val,
    "lte": lambda col, val: col <= val,
    "like": lambda col, val: col.ilike(f"%{val}%"),
}

COLUNAS_FILTRAVEIS = {"cpf_cidadao", "categoria_id", "prioridade_id", "status", "descricao"}


def _aplicar_filtros(query, filtros: list[str]):
    for f in filtros:
        partes = f.split(":", 2)
        if len(partes) != 3:
            continue
        campo, operador, valor = partes
        if campo not in COLUNAS_FILTRAVEIS or operador not in OPERADORES:
            continue
        coluna = getattr(Ocorrencia, campo, None)
        if coluna is None:
            continue
        query = query.filter(OPERADORES[operador](coluna, valor))
    return query


@router.get("/dashboard/contadores")
def contadores(db: Session = Depends(get_db)):
    resultados = db.query(Ocorrencia.status, func.count(Ocorrencia.id)).group_by(Ocorrencia.status).all()
    contagem = {s: 0 for s in TODOS_STATUS}
    for status_nome, count in resultados:
        contagem[status_nome] = count
    return contagem


@router.get("/dashboard/timeline")
def timeline(dias: int = Query(30, ge=7, le=90), db: Session = Depends(get_db)):
    data_inicio = datetime.now(timezone.utc) - timedelta(days=dias)
    resultados = (
        db.query(
            cast(Ocorrencia.data_abertura, Date).label("data"),
            func.count(Ocorrencia.id).label("total"),
        )
        .filter(Ocorrencia.data_abertura >= data_inicio)
        .group_by(cast(Ocorrencia.data_abertura, Date))
        .order_by(cast(Ocorrencia.data_abertura, Date))
        .all()
    )
    dados = {str(r.data): r.total for r in resultados}
    timeline = []
    for i in range(dias):
        d = (datetime.now(timezone.utc) - timedelta(days=dias - 1 - i)).strftime("%Y-%m-%d")
        timeline.append({"data": d, "total": dados.get(d, 0)})
    return timeline


@router.get("/dashboard/recentes")
def recentes(db: Session = Depends(get_db)):
    items = (
        db.query(Historico)
        .order_by(Historico.data_alteracao.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": h.id,
            "ocorrencia_id": h.ocorrencia_id,
            "status_anterior": h.status_anterior,
            "status_novo": h.status_novo,
            "data_alteracao": h.data_alteracao.isoformat(),
        }
        for h in items
    ]


@router.get("/", response_model=OcorrenciaListResponse)
def listar(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    filtro: list[str] = Query(default=[]),
    search: str = Query(default=""),
    db: Session = Depends(get_db),
):
    query = db.query(Ocorrencia)
    query = _aplicar_filtros(query, filtro)

    if search.strip():
        termo = search.strip()
        termo_limpo = re.sub(r"\D", "", termo)
        if termo_limpo == termo and len(termo) <= 3:
            query = query.filter(Ocorrencia.id == int(termo))
        else:
            conditions = [
                Ocorrencia.descricao.ilike(f"%{termo}%"),
            ]
            if termo_limpo:
                conditions.append(Ocorrencia.cpf_cidadao.ilike(f"%{termo_limpo}%"))
            query = query.filter(or_(*conditions))

    total = query.count()
    pages = max(1, (total + page_size - 1) // page_size)
    items = query.order_by(Ocorrencia.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return OcorrenciaListResponse(items=items, total=total, page=page, pages=pages)


@router.get("/{id}", response_model=OcorrenciaResponse)
def obter(id: int, db: Session = Depends(get_db)):
    oc = db.query(Ocorrencia).filter(Ocorrencia.id == id).first()
    if not oc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrencia nao encontrada")
    return oc


@router.post("/", response_model=OcorrenciaResponse, status_code=status.HTTP_201_CREATED)
def criar(data: OcorrenciaCreate, db: Session = Depends(get_db)):
    cpf_limpo = re.sub(r"\D", "", data.cpf_cidadao)
    if not validar_cpf(cpf_limpo):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="CPF invalido")

    if not db.query(Categoria).filter(Categoria.id == data.categoria_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Categoria nao encontrada")
    if not db.query(Prioridade).filter(Prioridade.id == data.prioridade_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Prioridade nao encontrada")

    oc = Ocorrencia(
        cpf_cidadao=cpf_limpo,
        categoria_id=data.categoria_id,
        prioridade_id=data.prioridade_id,
        descricao=data.descricao,
        status="Aberta",
    )
    db.add(oc)
    db.flush()

    historico = Historico(ocorrencia_id=oc.id, status_anterior=None, status_novo="Aberta")
    db.add(historico)
    db.commit()
    db.refresh(oc)
    return oc


@router.put("/{id}", response_model=OcorrenciaResponse)
def atualizar(id: int, data: OcorrenciaUpdate, db: Session = Depends(get_db)):
    oc = db.query(Ocorrencia).filter(Ocorrencia.id == id).first()
    if not oc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrencia nao encontrada")

    if data.status is not None and data.status != oc.status:
        if data.status not in TODOS_STATUS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Status invalido. Valores aceitos: {', '.join(TODOS_STATUS)}",
            )
        if not validar_transicao(oc.status, data.status):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Transicao de '{oc.status}' para '{data.status}' nao permitida",
            )
        historico = Historico(ocorrencia_id=oc.id, status_anterior=oc.status, status_novo=data.status)
        db.add(historico)
        oc.status = data.status

        if data.status in ("Fechada", "Cancelada"):
            encerramento = datetime.now(timezone.utc)
            if encerramento < oc.data_abertura:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Data de encerramento nao pode ser anterior a data de abertura",
                )
            oc.data_encerramento = encerramento

    if data.categoria_id is not None:
        if not db.query(Categoria).filter(Categoria.id == data.categoria_id).first():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Categoria nao encontrada")
        oc.categoria_id = data.categoria_id
    if data.prioridade_id is not None:
        if not db.query(Prioridade).filter(Prioridade.id == data.prioridade_id).first():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Prioridade nao encontrada")
        oc.prioridade_id = data.prioridade_id
    if data.descricao is not None:
        oc.descricao = data.descricao

    db.commit()
    db.refresh(oc)
    return oc


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(id: int, db: Session = Depends(get_db)):
    oc = db.query(Ocorrencia).filter(Ocorrencia.id == id).first()
    if not oc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrencia nao encontrada")
    db.delete(oc)
    db.commit()


@router.get("/{id}/historico", response_model=list[HistoricoResponse])
def historico(id: int, db: Session = Depends(get_db)):
    oc = db.query(Ocorrencia).filter(Ocorrencia.id == id).first()
    if not oc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrencia nao encontrada")
    return db.query(Historico).filter(Historico.ocorrencia_id == id).order_by(Historico.data_alteracao).all()


