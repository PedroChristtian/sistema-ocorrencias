# Sistema de Controle de Ocorrencias Municipais

Sistema web para registro, acompanhamento e gestao de ocorrencias municipais (reclamacoes, denuncias e solicitacoes). Desenvolvido com FastAPI no backend e React no frontend.

## Tecnologias

### Backend
- Python 3.12 + FastAPI
- SQLAlchemy ORM + Alembic (migracoes)
- PostgreSQL 16 (via Docker)
- Autenticacao JWT (access + refresh tokens)
- Blacklist de tokens persistente no banco
- Validacao de CPF (algoritmo modulo-11)
- Rate limiting nos endpoints de autenticacao
- Paginacao server-side com filtros dinamicos

### Frontend
- React 19 + TypeScript
- Material UI (MUI) 7
- Recharts (graficos)
- Framer Motion (animacoes)
- React Hook Form + Zod (validacao)
- Axios com interceptors para refresh automatico
- Tema dark/light com glassmorphism

## Pre-requisitos

- Docker Desktop (para o PostgreSQL)
- Python 3.12+
- Node.js 18+

## Como rodar

### 1. Banco de dados

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python seed.py              # popular dados iniciais
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**

### Login padrao

| Email           | Senha    |
|-----------------|----------|
| admin@admin.com | admin123 |

## Estrutura do projeto

```
projetomunicipio/
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── config.py              # variaveis de ambiente
│   │   ├── database.py            # conexao SQLAlchemy
│   │   ├── main.py                # app FastAPI
│   │   ├── models/                # modelos do banco
│   │   │   ├── categoria.py
│   │   │   ├── historico.py
│   │   │   ├── ocorrencia.py
│   │   │   ├── prioridade.py
│   │   │   ├── token_blacklist.py
│   │   │   └── usuario.py
│   │   ├── routers/               # endpoints da API
│   │   │   ├── auth.py
│   │   │   ├── categorias.py
│   │   │   ├── ocorrencias.py
│   │   │   └── prioridades.py
│   │   ├── schemas/               # schemas Pydantic
│   │   ├── services/
│   │   │   ├── auth_deps.py       # dependencia de autenticacao
│   │   │   └── status_machine.py  # maquina de estados
│   │   └── utils/
│   │       ├── cpf.py             # validacao de CPF
│   │       └── security.py        # hash, JWT, blacklist
│   ├── seed.py                    # dados iniciais
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/axios.ts           # cliente HTTP
        ├── components/            # componentes reutilizaveis
        ├── contexts/              # AuthContext, ThemeContext
        ├── pages/                 # paginas da aplicacao
        └── types/                 # tipagens TypeScript
```

## Funcionalidades

### Dashboard
- Cards com contadores por status
- Grafico de area (timeline 30 dias)
- Grafico de barras (ocorrencias por status)
- Grafico de pizza (distribuicao)
- Feed de atividades recentes
- Auto-refresh a cada 30 segundos

### Ocorrencias
- CRUD completo com DataGrid paginado
- Filtro por status
- Busca por ID, CPF ou descricao
- Exportacao CSV (separador ponto-e-virgula, UTF-8 com BOM)
- Historico de alteracoes com timeline

### Kanban
- Visualizacao de ocorrencias agrupadas por status

### Autenticacao
- Login com JWT (access token 30min + refresh token 24h)
- Refresh automatico via interceptor Axios
- Blacklist de tokens persistente no PostgreSQL
- Rate limiting (5 tentativas/minuto no login)
- Registro de novos usuarios

## Maquina de estados

```
Aberta → Em Analise → Em Andamento → Resolvida → Fechada
  ↓
Cancelada
```

Transicoes fora desse fluxo sao rejeitadas pela API.

## API - Endpoints principais

| Metodo | Rota                                | Descricao                    |
|--------|-------------------------------------|------------------------------|
| POST   | /api/auth/login                     | Login                        |
| POST   | /api/auth/register                  | Registro                     |
| POST   | /api/auth/refresh                   | Renovar token                |
| POST   | /api/auth/logout                    | Logout (blacklist token)     |
| GET    | /api/ocorrencias/                   | Listar (paginado + filtros)  |
| POST   | /api/ocorrencias/                   | Criar ocorrencia             |
| GET    | /api/ocorrencias/{id}               | Detalhar ocorrencia          |
| PUT    | /api/ocorrencias/{id}               | Atualizar ocorrencia         |
| DELETE | /api/ocorrencias/{id}               | Remover ocorrencia           |
| GET    | /api/ocorrencias/{id}/historico     | Historico de status          |
| GET    | /api/ocorrencias/dashboard/contadores | Contadores por status      |
| GET    | /api/ocorrencias/dashboard/timeline | Timeline de abertura         |
| GET    | /api/ocorrencias/dashboard/recentes | Atividades recentes          |
| GET    | /api/categorias/                    | Listar categorias            |
| GET    | /api/prioridades/                   | Listar prioridades           |

## Filtros dinamicos

```
GET /api/ocorrencias/?filtro=status:eq:Aberta&filtro=prioridade_id:gte:3
```

Operadores suportados: `eq`, `ne`, `gt`, `lt`, `gte`, `lte`, `like`

## Variaveis de ambiente

Criar arquivo `backend/.env` (opcional, ja tem valores padrao):

```env
DATABASE_URL=postgresql://municipio:municipio123@localhost:5432/municipio_db
SECRET_KEY=sua-chave-secreta
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
```
