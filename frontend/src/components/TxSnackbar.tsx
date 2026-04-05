import { Alert, Snackbar, type AlertColor } from "@mui/material";

interface TxSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

export default function TxSnackbar({
  open,
  message,
  severity,
  onClose,
}: TxSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
