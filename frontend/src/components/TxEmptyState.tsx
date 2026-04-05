import { Box, Typography, Button } from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";
import { type ReactNode } from "react";

interface TxEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function TxEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: TxEmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        {icon ?? (
          <InboxOutlined sx={{ fontSize: 40, color: "text.secondary" }} />
        )}
      </Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 360 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
