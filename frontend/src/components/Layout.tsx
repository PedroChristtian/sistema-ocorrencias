import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DarkMode,
  Dashboard as DashboardIcon,
  Home,
  LightMode,
  ListAlt,
  Logout,
  Menu as MenuIcon,
  NavigateNext,
  Notifications,
  Person,
  Search,
  ViewKanban,
} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeMode } from "@/contexts/ThemeContext";
import TxPageTransition from "@/components/TxPageTransition";
import api from "@/api/axios";
import type { Historico } from "@/types";

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Ocorrencias", icon: <ListAlt />, path: "/ocorrencias" },
  { text: "Ocorrencias por Status", icon: <ViewKanban />, path: "/kanban" },
];

const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/ocorrencias": "Ocorrencias",
  "/kanban": "Ocorrencias por Status",
  "/perfil": "Meu Perfil",
};

export default function Layout() {
  const { logout, userName } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Historico[]>([]);

  const currentWidth = isMobile
    ? 0
    : collapsed
      ? DRAWER_COLLAPSED
      : DRAWER_WIDTH;

  useEffect(() => {
    api
      .get<Historico[]>("/ocorrencias/1/historico")
      .then((r) => setNotifications(r.data.slice(-5).reverse()))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ocorrencias?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2.5,
          pt: collapsed ? 1.5 : 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
            OM
          </Typography>
        </Box>
        {!collapsed && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Ocorrencias
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Painel Municipal
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <List sx={{ px: collapsed ? 0.5 : 1, flexGrow: 1, mt: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <Tooltip
              key={item.text}
              title={collapsed ? item.text : ""}
              placement="right"
              arrow
            >
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setDrawerOpen(false);
                }}
                sx={{
                  mb: 0.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1.5 : 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: selected ? "primary.main" : "text.secondary",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: selected ? 600 : 400,
                      fontSize: 14,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <Box sx={{ p: 1.5, display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              color: "primary.main",
              "&:hover": {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          ml: `${currentWidth}px`,
          width: `calc(100% - ${currentWidth}px)`,
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 1, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Search bar - always expanded */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
              borderRadius: 2.5,
              px: 1.5,
              py: 0.5,
              flex: 1,
              maxWidth: { xs: 200, sm: 360, md: 420 },
              border: (t) => `1px solid ${alpha(t.palette.text.primary, 0.06)}`,
              "&:focus-within": {
                bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                borderColor: (t) => alpha(t.palette.primary.main, 0.3),
              },
            }}
          >
            <Search
              sx={{ color: "text.secondary", fontSize: 20, flexShrink: 0 }}
            />
            <InputBase
              placeholder="Buscar por CPF, ID ou descricao..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: 13,
                color: "text.primary",
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Theme toggle */}
          <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
            <IconButton onClick={toggleTheme} sx={{ color: "text.secondary" }}>
              {mode === "dark" ? (
                <LightMode fontSize="small" />
              ) : (
                <DarkMode fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notificacoes">
            <IconButton
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ color: "text.secondary" }}
            >
              <Badge
                badgeContent={notifications.length}
                color="error"
                variant="dot"
              >
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notifAnchor}
            open={!!notifAnchor}
            onClose={() => setNotifAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: {
                  width: 320,
                  maxHeight: 400,
                  mt: 1,
                  borderRadius: 3,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Ultimas Alteracoes
              </Typography>
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma notificacao
                </Typography>
              </MenuItem>
            ) : (
              notifications.map((n) => (
                <MenuItem
                  key={n.id}
                  onClick={() => {
                    setNotifAnchor(null);
                    navigate("/ocorrencias");
                  }}
                  sx={{ py: 1.5 }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Ocorrencia #{n.ocorrencia_id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.status_anterior ?? "Criada"} → {n.status_novo} ·{" "}
                      {new Date(n.data_alteracao).toLocaleString("pt-BR")}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Profile menu */}
          <Tooltip title="Perfil">
            <IconButton
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {userName?.charAt(0).toUpperCase() ?? "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchor}
            open={!!profileAnchor}
            onClose={() => setProfileAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: { sx: { width: 220, mt: 1, borderRadius: 3 } },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {userName ?? "Usuario"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrador
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                navigate("/perfil");
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
                Meu Perfil
              </ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                logout();
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
                Sair
              </ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: currentWidth,
            flexShrink: 0,
            transition: "width 0.3s ease",
            "& .MuiDrawer-paper": {
              width: currentWidth,
              boxSizing: "border-box",
              transition: "width 0.3s ease",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          maxWidth: "100%",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Toolbar />

        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 16 }} />}
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: 13,
            }}
          >
            <Home sx={{ fontSize: 16 }} />
            Inicio
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
            {BREADCRUMB_MAP[location.pathname] ?? "Pagina"}
          </Typography>
        </Breadcrumbs>

        <AnimatePresence mode="wait">
          <TxPageTransition key={location.pathname}>
            <Outlet />
          </TxPageTransition>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
