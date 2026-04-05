TRANSICOES_VALIDAS: dict[str, list[str]] = {
    "Aberta": ["Em Analise", "Cancelada"],
    "Em Analise": ["Em Andamento"],
    "Em Andamento": ["Resolvida"],
    "Resolvida": ["Fechada"],
    "Fechada": [],
    "Cancelada": [],
}

TODOS_STATUS = list(TRANSICOES_VALIDAS.keys())


def validar_transicao(status_atual: str, status_novo: str) -> bool:
    permitidos = TRANSICOES_VALIDAS.get(status_atual, [])
    return status_novo in permitidos
