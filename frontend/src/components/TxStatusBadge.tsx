import { Box, Typography } from "@mui/material";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Aberta: { bg: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" },
  "Em Analise": { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" },
  "Em Andamento": { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1" },
  Resolvida: { bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" },
  Fechada: { bg: "rgba(100, 116, 139, 0.12)", color: "#64748b" },
  Cancelada: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
};

interface TxStatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export default function TxStatusBadge({
  status,
  size = "small",
}: TxStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { bg: "rgba(100,116,139,0.12)", color: "#64748b" };
  const isSmall = size === "small";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: isSmall ? 1.5 : 2,
        py: isSmall ? 0.375 : 0.5,
        borderRadius: 2,
        bgcolor: style.bg,
        border: `1px solid ${style.color}20`,
      }}
    >
      <Box
        sx={{
          width: isSmall ? 6 : 8,
          height: isSmall ? 6 : 8,
          borderRadius: "50%",
          bgcolor: style.color,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: style.color,
          fontWeight: 700,
          fontSize: isSmall ? 11 : 13,
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}
