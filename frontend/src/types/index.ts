export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Prioridade {
  id: number;
  nome: string;
  nivel: number;
}

export interface Ocorrencia {
  id: number;
  cpf_cidadao: string;
  categoria_id: number;
  prioridade_id: number;
  status: string;
  descricao: string;
  data_abertura: string;
  data_encerramento: string | null;
  categoria: Categoria;
  prioridade: Prioridade;
}

export interface OcorrenciaListResponse {
  items: Ocorrencia[];
  total: number;
  page: number;
  pages: number;
}

export interface Historico {
  id: number;
  ocorrencia_id: number;
  status_anterior: string | null;
  status_novo: string;
  data_alteracao: string;
}

export interface DashboardContadores {
  [key: string]: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}
