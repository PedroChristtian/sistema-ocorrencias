import { Box, Card, CardContent, Grid, Skeleton } from "@mui/material";

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 3 }} />

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );
}

export function TableSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={48}
            sx={{ mb: 1, borderRadius: 2 }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function KanbanSkeleton() {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map((col) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={col}>
          <Skeleton variant="rounded" height={40} sx={{ mb: 2, borderRadius: 2 }} />
          {[1, 2, 3].map((card) => (
            <Skeleton
              key={card}
              variant="rounded"
              height={100}
              sx={{ mb: 1.5, borderRadius: 3 }}
            />
          ))}
        </Grid>
      ))}
    </Grid>
  );
}
