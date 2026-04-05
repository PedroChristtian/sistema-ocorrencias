import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import api from "@/api/axios";
import TxStatusBadge from "@/components/TxStatusBadge";
import { KanbanSkeleton } from "@/components/TxSkeleton";
import TxEmptyState from "@/components/TxEmptyState";
import type { Ocorrencia, OcorrenciaListResponse } from "@/types";

const KANBAN_COLUMNS = [
  { status: "Aberta", color: "#3b82f6" },
  { status: "Em Analise", color: "#f59e0b" },
  { status: "Em Andamento", color: "#6366f1" },
  { status: "Resolvida", color: "#10b981" },
  { status: "Fechada", color: "#64748b" },
  { status: "Cancelada", color: "#ef4444" },
];

export default function KanbanPage() {
  const theme = useTheme();
  const [columns, setColumns] = useState<Record<string, Ocorrencia[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result: Record<string, Ocorrencia[]> = {};
      const promises = KANBAN_COLUMNS.map(async (col) => {
        const { data } = await api.get<OcorrenciaListResponse>(
          `/ocorrencias/?page_size=50&filtro=status:eq:${col.status}`
        );
        result[col.status] = data.items;
      });
      await Promise.all(promises);
      setColumns(result);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <KanbanSkeleton />;

  const totalCards = Object.values(columns).reduce((a, b) => a + b.length, 0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Ocorrencias por Status</Typography>
        <Typography variant="body2" color="text.secondary">
          Visualizacao organizada por status
        </Typography>
      </Box>

      {totalCards === 0 ? (
        <TxEmptyState
          title="Nenhuma ocorrencia encontrada"
          description="Crie uma nova ocorrencia para visualizar no kanban."
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 2,
            minHeight: 400,
          }}
        >
          {KANBAN_COLUMNS.map((col) => {
            const items = columns[col.status] ?? [];
            return (
              <Box
                key={col.status}
                sx={{
                  minWidth: { xs: 280, sm: 300 },
                  maxWidth: 320,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Column header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: col.color,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {col.status}
                  </Typography>
                  <Chip
                    label={items.length}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: alpha(col.color, 0.12),
                      color: col.color,
                    }}
                  />
                </Box>

                {/* Cards */}
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: alpha(
                      theme.palette.text.primary,
                      theme.palette.mode === "dark" ? 0.03 : 0.02
                    ),
                    borderRadius: 3,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 280px)",
                  }}
                >
                  {items.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        border: `2px dashed ${theme.palette.divider}`,
                        borderRadius: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Nenhuma ocorrencia
                      </Typography>
                    </Box>
                  ) : (
                    items.map((oc, idx) => (
                      <motion.div
                        key={oc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Card
                          sx={{
                            cursor: "pointer",
                            transition:
                              "transform 0.15s ease, box-shadow 0.15s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 4px 16px ${alpha(col.color, 0.15)}`,
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: col.color,
                                  fontSize: 11,
                                }}
                              >
                                #{oc.id}
                              </Typography>
                              <TxStatusBadge status={oc.status} size="small" />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                mb: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.4,
                              }}
                            >
                              {oc.descricao}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={oc.categoria.nome}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 22,
                                  fontSize: 10,
                                  fontWeight: 600,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: 10 }}
                              >
                                {new Date(oc.data_abertura).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
