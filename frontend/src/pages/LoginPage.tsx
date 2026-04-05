import { zodResolver } from "@hookform/resolvers/zod";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  senha: z.string().min(1, "Senha obrigatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.senha);
      navigate("/");
    } catch {
      setError("Credenciais invalidas. Verifique seu email e senha.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 70%)"
            : "radial-gradient(ellipse at top, #e0e7ff 0%, #f8fafc 70%)",
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", p: { xs: 1, sm: 2 } }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "#fff", fontWeight: 800 }}
              >
                OM
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Bem-vindo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sistema de Ocorrencias Municipais
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              fullWidth
              label="Email"
              autoComplete="email"
              autoFocus
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("senha")}
              error={!!errors.senha}
              helperText={errors.senha?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.5, mt: 1, fontSize: 15 }}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
