import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import {
  Email,
  Person,
  Shield,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";

export default function PerfilPage() {
  const { userName } = useAuth();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: 32,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {userName?.charAt(0).toUpperCase() ?? "U"}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {userName ?? "Usuario"}
              </Typography>
              <Chip
                label="Administrador"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Informacoes da Conta
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <Person color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Administrador
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <Email color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {userName ?? "—"}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <Shield color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Perfil de Acesso
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Administrador
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
