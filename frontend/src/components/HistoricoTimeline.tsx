import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import TxStatusBadge from "@/components/TxStatusBadge";
import type { Historico } from "@/types";

interface HistoricoTimelineProps {
  ocorrenciaId: number;
}

export default function HistoricoTimeline({
  ocorrenciaId,
}: HistoricoTimelineProps) {
  const [items, setItems] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Historico[]>(`/ocorrencias/${ocorrenciaId}/historico`)
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ocorrenciaId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return <Typography color="text.secondary">Nenhum registro encontrado.</Typography>;
  }

  return (
    <Timeline position="alternate">
      {items.map((item, index) => (
        <TimelineItem key={item.id}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index < items.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Box>
              {item.status_anterior && (
                <Box sx={{ mb: 0.5 }}>
                  <TxStatusBadge status={item.status_anterior} size="small" />
                  <Typography variant="caption" sx={{ mx: 0.5 }}>
                    →
                  </Typography>
                  <TxStatusBadge status={item.status_novo} size="small" />
                </Box>
              )}
              {!item.status_anterior && (
                <TxStatusBadge status={item.status_novo} size="small" />
              )}
              <Typography variant="caption" color="text.secondary" display="block">
                {new Date(item.data_alteracao).toLocaleString("pt-BR")}
              </Typography>
            </Box>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
