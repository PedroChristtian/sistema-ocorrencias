import { Add, Download, History, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/axios";
import TxStatusBadge from "@/components/TxStatusBadge";
import TxConfirmDialog from "@/components/TxConfirmDialog";
import TxSnackbar from "@/components/TxSnackbar";
import OcorrenciaForm from "@/components/OcorrenciaForm";
import HistoricoTimeline from "@/components/HistoricoTimeline";
import type { Ocorrencia, OcorrenciaListResponse, Categoria, Prioridade } from "@/types";

const STATUS_OPTIONS = [
  "Aberta",
  "Em Analise",
  "Em Andamento",
  "Resolvida",
  "Fechada",
  "Cancelada",
];

export default function OcorrenciasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [rows, setRows] = useState<Ocorrencia[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ocorrencia | null>(null);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showMessage = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(paginationModel.page + 1));
      params.set("page_size", String(paginationModel.pageSize));
      if (filterStatus) {
        params.append("filtro", `status:eq:${filterStatus}`);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      const { data } = await api.get<OcorrenciaListResponse>(
        `/ocorrencias/?${params.toString()}`
      );
      setRows(data.items);
      setTotal(data.total);
    } catch {
      showMessage("Erro ao carregar ocorrencias", "error");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filterStatus, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }, [searchQuery]);

  useEffect(() => {
    Promise.all([api.get("/categorias/"), api.get("/prioridades/")]).then(
      ([catRes, priRes]) => {
        setCategorias(catRes.data);
        setPrioridades(priRes.data);
      }
    );
  }, []);

  const handleDelete = async () => {
    if (deleteConfirm === null) return;
    try {
      await api.delete(`/ocorrencias/${deleteConfirm}`);
      showMessage("Ocorrencia removida com sucesso");
      fetchData();
    } catch {
      showMessage("Erro ao remover ocorrencia", "error");
    }
    setDeleteConfirm(null);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditing(null);
    fetchData();
  };

  const formatCPF = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const escapeCSV = (value: string) => {
    if (value.includes(";") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const [exporting, setExporting] = useState(false);

  const exportCSV = async () => {
    setExporting(true);
    try {
      // Buscar todos os registros, nao so a pagina atual
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("page_size", "100");
      if (filterStatus) {
        params.append("filtro", `status:eq:${filterStatus}`);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      let allItems: Ocorrencia[] = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        params.set("page", String(currentPage));
        const { data } = await api.get<OcorrenciaListResponse>(
          `/ocorrencias/?${params.toString()}`
        );
        allItems = [...allItems, ...data.items];
        totalPages = data.pages;
        currentPage++;
      }

      if (allItems.length === 0) {
        showMessage("Nenhum registro para exportar", "error");
        return;
      }

      const SEP = ";";
      const header = [
        "ID",
        "CPF do Cidadao",
        "Categoria",
        "Prioridade",
        "Nivel Prioridade",
        "Status",
        "Descricao",
        "Data de Abertura",
        "Data de Encerramento",
      ].join(SEP);

      const lines = allItems.map((r) =>
        [
          r.id,
          formatCPF(r.cpf_cidadao),
          escapeCSV(r.categoria.nome),
          escapeCSV(r.prioridade.nome),
          r.prioridade.nivel,
          r.status,
          escapeCSV(r.descricao),
          formatDate(r.data_abertura),
          r.data_encerramento ? formatDate(r.data_encerramento) : "",
        ].join(SEP)
      );

      const csv = [header, ...lines].join("\r\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ocorrencias_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showMessage(`${allItems.length} registro(s) exportado(s) com sucesso`);
    } catch {
      showMessage("Erro ao exportar dados", "error");
    } finally {
      setExporting(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "cpf_cidadao", headerName: "CPF", width: 130 },
    {
      field: "categoria",
      headerName: "Categoria",
      width: 140,
      valueGetter: (_value, row) => row.categoria?.nome ?? "",
    },
    {
      field: "prioridade",
      headerName: "Prioridade",
      width: 120,
      valueGetter: (_value, row) => row.prioridade?.nome ?? "",
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <TxStatusBadge status={params.value} />,
    },
    {
      field: "descricao",
      headerName: "Descricao",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "data_abertura",
      headerName: "Abertura",
      width: 160,
      valueFormatter: (value: string) =>
        new Date(value).toLocaleDateString("pt-BR"),
    },
    {
      field: "acoes",
      headerName: "Acoes",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(params.row as Ocorrencia);
                setFormOpen(true);
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Historico">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedId(params.row.id);
                setHistoricoOpen(true);
              }}
            >
              <History fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          Ocorrencias
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportCSV}
            disabled={rows.length === 0 || exporting}
          >
            {exporting ? "Exportando..." : "Exportar CSV"}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Abrir Ocorrencia
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filtrar por Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filtrar por Status"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {searchQuery && (
          <Chip
            label={`Busca: "${searchQuery}"`}
            onDelete={() => setSearchParams({})}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={total}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ bgcolor: "background.paper" }}
      />

      <Dialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? `Editar Ocorrencia #${editing.id}` : "Nova Ocorrencia"}
        </DialogTitle>
        <DialogContent>
          <OcorrenciaForm
            ocorrencia={editing}
            categorias={categorias}
            prioridades={prioridades}
            onSuccess={handleFormSuccess}
            onError={(msg) => showMessage(msg, "error")}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={historicoOpen}
        onClose={() => setHistoricoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Historico de Alteracoes</DialogTitle>
        <DialogContent>
          {selectedId && <HistoricoTimeline ocorrenciaId={selectedId} />}
        </DialogContent>
      </Dialog>

      <TxConfirmDialog
        open={deleteConfirm !== null}
        title="Confirmar exclusao"
        message="Deseja realmente excluir esta ocorrencia?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <TxSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}
