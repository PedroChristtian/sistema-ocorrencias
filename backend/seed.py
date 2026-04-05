"""Script para popular o banco com dados iniciais."""
from datetime import datetime, timedelta, timezone

from app.database import Base, SessionLocal, engine
from app.models.categoria import Categoria
from app.models.historico import Historico
from app.models.ocorrencia import Ocorrencia
from app.models.prioridade import Prioridade
from app.models.usuario import Usuario
from app.utils.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── Usuario admin ──
if not db.query(Usuario).filter(Usuario.email == "admin@admin.com").first():
    db.add(Usuario(nome="Administrador", email="admin@admin.com", senha_hash=hash_password("admin123")))

# ── Categorias ──
for nome, desc in [
    ("Reclamacao", "Reclamacoes gerais dos cidadaos"),
    ("Denuncia", "Denuncias sobre irregularidades"),
    ("Solicitacao", "Solicitacoes de servicos municipais"),
]:
    if not db.query(Categoria).filter(Categoria.nome == nome).first():
        db.add(Categoria(nome=nome, descricao=desc))

# ── Prioridades ──
for nome, nivel in [("Baixa", 1), ("Media", 2), ("Alta", 3), ("Critica", 4)]:
    if not db.query(Prioridade).filter(Prioridade.nome == nome).first():
        db.add(Prioridade(nome=nome, nivel=nivel))

db.commit()

# ── Ocorrencias (20) ──
if db.query(Ocorrencia).count() == 0:
    cats = {c.nome: c.id for c in db.query(Categoria).all()}
    pris = {p.nome: p.id for p in db.query(Prioridade).all()}
    agora = datetime.now(timezone.utc)

    dados = [
        ("52998224725", "Reclamacao", "Alta", "Buraco grande na Rua XV de Novembro proximo ao numero 320, causando risco a veiculos e pedestres"),
        ("11144477735", "Denuncia", "Critica", "Despejo irregular de esgoto no Ribeirao das Pedras, proximo a ponte da Av. Brasil"),
        ("98765432100", "Solicitacao", "Media", "Solicitacao de poda de arvore na Praca da Liberdade, galhos obstruindo a iluminacao publica"),
        ("52998224725", "Reclamacao", "Baixa", "Lixeira publica danificada na esquina da Rua das Flores com Av. Paulista"),
        ("11144477735", "Denuncia", "Alta", "Construcao irregular sem alvara na Rua Tiradentes, numero 450, bairro Centro"),
        ("98765432100", "Solicitacao", "Media", "Solicitacao de instalacao de lombada na Rua das Acacias, proximo a escola municipal"),
        ("52998224725", "Reclamacao", "Critica", "Falta de agua ha 3 dias no bairro Jardim America, mais de 200 familias afetadas"),
        ("11144477735", "Denuncia", "Alta", "Terreno baldio com acumulo de lixo e foco de dengue na Rua Minas Gerais, 780"),
        ("98765432100", "Solicitacao", "Baixa", "Solicitacao de pintura de faixa de pedestres na Av. Independencia, proximo ao terminal"),
        ("52998224725", "Reclamacao", "Media", "Semaforo com defeito no cruzamento da Av. Brasil com Rua Parana, piscando amarelo ha uma semana"),
        ("11144477735", "Denuncia", "Critica", "Descarte de entulho em area de preservacao permanente no Parque Municipal"),
        ("98765432100", "Solicitacao", "Alta", "Solicitacao de reparo na iluminacao publica da Rua Santos Dumont, trecho escuro ha 15 dias"),
        ("52998224725", "Reclamacao", "Media", "Vazamento de agua na calcada da Av. Rio Branco, desperdicando agua potavel"),
        ("11144477735", "Denuncia", "Alta", "Poluicao sonora de estabelecimento comercial na Rua Sao Paulo apos as 22h"),
        ("98765432100", "Solicitacao", "Baixa", "Solicitacao de instalacao de banco na parada de onibus da Av. Goias"),
        ("52998224725", "Reclamacao", "Critica", "Ponte com estrutura comprometida na estrada rural do Bairro Boa Vista, risco de desabamento"),
        ("11144477735", "Denuncia", "Media", "Comercio ambulante irregular obstruindo calcada na Praca Central"),
        ("98765432100", "Solicitacao", "Alta", "Solicitacao de limpeza de bueiro entupido na Rua Bahia, alagamento em dias de chuva"),
        ("52998224725", "Reclamacao", "Baixa", "Placa de sinalizacao caida na rotatoria da Av. Mato Grosso"),
        ("11144477735", "Denuncia", "Critica", "Queimada em terreno proximo a area residencial no Bairro Novo Horizonte"),
    ]

    ids = []
    for i, (cpf, cat, pri, desc) in enumerate(dados):
        oc = Ocorrencia(
            cpf_cidadao=cpf,
            categoria_id=cats[cat],
            prioridade_id=pris[pri],
            descricao=desc,
            status="Aberta",
            data_abertura=agora - timedelta(days=20 - i),
        )
        db.add(oc)
        db.flush()
        ids.append(oc.id)

        db.add(Historico(
            ocorrencia_id=oc.id,
            status_anterior=None,
            status_novo="Aberta",
            data_alteracao=agora - timedelta(days=20 - i),
        ))

    db.commit()

    # ── Avancar status de algumas ocorrencias ──
    def avancar(oc_id: int, transicoes: list[str], dias_offset: int):
        oc = db.query(Ocorrencia).filter(Ocorrencia.id == oc_id).first()
        for j, novo_status in enumerate(transicoes):
            anterior = oc.status
            oc.status = novo_status
            if novo_status in ("Fechada", "Cancelada"):
                oc.data_encerramento = agora - timedelta(days=dias_offset - j - 1)
            db.add(Historico(
                ocorrencia_id=oc.id,
                status_anterior=anterior,
                status_novo=novo_status,
                data_alteracao=agora - timedelta(days=dias_offset - j - 1),
            ))
        db.commit()

    avancar(ids[1],  ["Em Analise", "Em Andamento", "Resolvida"], 15)
    avancar(ids[2],  ["Em Analise"], 12)
    avancar(ids[3],  ["Cancelada"], 10)
    avancar(ids[4],  ["Em Analise", "Em Andamento"], 14)
    avancar(ids[5],  ["Em Analise", "Em Andamento", "Resolvida", "Fechada"], 13)
    avancar(ids[6],  ["Em Analise", "Em Andamento"], 11)
    avancar(ids[7],  ["Em Analise"], 9)
    avancar(ids[9],  ["Em Analise", "Em Andamento", "Resolvida"], 8)
    avancar(ids[10], ["Em Analise", "Em Andamento", "Resolvida", "Fechada"], 7)
    avancar(ids[11], ["Em Analise"], 6)
    avancar(ids[13], ["Em Analise", "Em Andamento"], 5)
    avancar(ids[15], ["Em Analise", "Em Andamento", "Resolvida"], 4)
    avancar(ids[18], ["Cancelada"], 3)
    avancar(ids[19], ["Em Analise"], 2)

    print("20 ocorrencias criadas com status variados!")

db.close()
print("Seed concluido! Login: admin@admin.com / admin123")
