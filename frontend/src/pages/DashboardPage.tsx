import {
  Assignment,
  Cancel,
  CheckCircle,
  HourglassEmpty,
  Loop,
  Refresh,
  Search,
  TrendingUp,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/api/axios";
import TxAnimatedCounter from "@/components/TxAnimatedCounter";
import TxStatusBadge from "@/components/TxStatusBadge";
import { DashboardSkeleton } from "@/components/TxSkeleton";
import type { DashboardContadores, Historico } from "@/types";

interface TimelinePoint {
  data: string;
  total: number;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: typeof Assignment; gradient: string }
> = {
  Aberta: {
    color: "#3b82f6",
    icon: Assignment,
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  "Em Analise": {
    color: "#f59e0b",
    icon: Search,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  "Em Andamento": {
    color: "#6366f1",
    icon: Loop,
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  },
  Resolvida: {
    color: "#10b981",
    icon: CheckCircle,
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  Fechada: {
    color: "#64748b",
    icon: HourglassEmpty,
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
  },
  Cancelada: {
    color: "#ef4444",
    icon: Cancel,
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const theme = useTheme();
  const [contadores, setContadores] = useState<DashboardContadores>({});
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [recentes, setRecentes] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [contRes, timeRes, recRes] = await Promise.all([
        api.get<DashboardContadores>("/ocorrencias/dashboard/contadores"),
        api.get<TimelinePoint[]>("/ocorrencias/dashboard/timeline?dias=30"),
        api.get<Historico[]>("/ocorrencias/dashboard/recentes"),
      ]);
      setContadores(contRes.data);
      setTimeline(timeRes.data);
      setRecentes(recRes.data);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  const total = Object.values(contadores).reduce((a, b) => a + b, 0);
  const abertas =
    (contadores["Aberta"] ?? 0) +
    (contadores["Em Analise"] ?? 0) +
    (contadores["Em Andamento"] ?? 0);

  const pieData = Object.entries(contadores)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_CONFIG[name]?.color ?? "#64748b",
    }));

  const barData = Object.entries(contadores).map(([name, value]) => ({
    name: name.length > 12 ? name.slice(0, 12) + "..." : name,
    fullName: name,
    quantidade: value,
    color: STATUS_CONFIG[name]?.color ?? "#64748b",
  }));

  const summaryCards = [
    {
      label: "Total",
      value: total,
      gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      shadow: "rgba(99, 102, 241, 0.3)",
    },
    {
      label: "Em Aberto",
      value: abertas,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      icon: <Assignment sx={{ fontSize: 28 }} />,
      shadow: "rgba(59, 130, 246, 0.3)",
    },
    {
      label: "Resolvidas",
      value: contadores["Resolvida"] ?? 0,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      shadow: "rgba(16, 185, 129, 0.3)",
    },
    {
      label: "Canceladas",
      value: contadores["Cancelada"] ?? 0,
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      icon: <Cancel sx={{ fontSize: 28 }} />,
      shadow: "rgba(239, 68, 68, 0.3)",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Visao geral das ocorrencias municipais
          </Typography>
        </Box>
        <Tooltip title="Atualizar dados">
          <IconButton
            onClick={() => fetchData(true)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              animation: refreshing ? "spin 1s linear infinite" : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {summaryCards.map((card, i) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={card.label}>
            <motion.div custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card
                sx={{
                  background: card.gradient,
                  color: "#fff",
                  overflow: "visible",
                  position: "relative",
                  boxShadow: `0 8px 24px ${card.shadow}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 32px ${card.shadow}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.85, mb: 0.5, fontSize: { xs: 11, sm: 13 } }}
                      >
                        {card.label}
                      </Typography>
                      <TxAnimatedCounter
                        value={card.value}
                        variant="h3"
                        sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", sm: "2.5rem" } }}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: { xs: 36, sm: 48 },
                        height: { xs: 36, sm: 48 },
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Timeline chart */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Evolucao - Ultimos 30 dias
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="data"
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => {
                    const d = new Date(v + "T00:00:00");
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload as TimelinePoint | undefined;
                    if (!item) return null;
                    const d = new Date(item.data + "T00:00:00");
                    return (
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 3,
                          px: 2,
                          py: 1.5,
                          boxShadow: 3,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {d.toLocaleDateString("pt-BR")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.total} ocorrencia(s)
                        </Typography>
                      </Box>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar + Pie */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Ocorrencias por Status
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData} barSize={40}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <RTooltip
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.08) }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0]?.payload as {
                          fullName?: string;
                          quantidade?: number;
                        } | undefined;
                        return (
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 3,
                              px: 2,
                              py: 1.5,
                              boxShadow: 3,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item?.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item?.quantidade ?? 0} ocorrencia(s)
                            </Typography>
                          </Box>
                        );
                      }}
                    />
                    <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible">
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Distribuicao
                </Typography>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                        }}
                      />
                      <Legend
                        formatter={(value: string) => (
                          <span
                            style={{
                              color: theme.palette.text.primary,
                              fontSize: 13,
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      height: 320,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      Nenhuma ocorrencia registrada
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Detail cards + Activity feed */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detalhamento por Status
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(contadores).map(([status, count], i) => {
              const config = STATUS_CONFIG[status];
              const Icon = config?.icon ?? Assignment;
              return (
                <Grid size={{ xs: 6, sm: 4, md: 4 }} key={status}>
                  <motion.div
                    custom={i + 7}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        transition: "transform 0.2s ease",
                        "&:hover": { transform: "translateY(-2px)" },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: config?.gradient ?? "#64748b",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Icon
                          sx={{
                            fontSize: 28,
                            color: config?.color ?? "text.secondary",
                            mb: 0.5,
                            opacity: 0.8,
                          }}
                        />
                        <TxAnimatedCounter
                          value={count}
                          variant="h4"
                          sx={{ fontWeight: 800, mb: 0.5 }}
                        />
                        <TxStatusBadge status={status} size="small" />
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Activity feed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Atividade Recente
          </Typography>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {recentes.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Nenhuma atividade recente
                  </Typography>
                </Box>
              ) : (
                recentes.map((item, idx) => (
                  <Box
                    key={item.id}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderBottom:
                        idx < recentes.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : "none",
                      transition: "background-color 0.15s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor:
                          STATUS_CONFIG[item.status_novo]?.color ?? "#64748b",
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: 13 }}
                        noWrap
                      >
                        Ocorrencia #{item.ocorrencia_id}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {item.status_anterior ?? "Criada"} →{" "}
                        {item.status_novo}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexShrink: 0, fontSize: 11 }}
                    >
                      {new Date(item.data_alteracao).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
