import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Grid, TextField, Button, Stack, Chip } from '@mui/material';
import { tripsAPI } from '../services/api';

const TripsListPage: React.FC = () => {
  const [mode, setMode] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const params: any = { page };
      if (mode) params.mode = mode;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await tripsAPI.getTrips(params);
      const list = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setItems(list);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-page-${page}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = ['id','start_time','end_time','transport_mode','distance_km'];
    const rows = items.map(t => [t.id, t.start_time, t.end_time || '', t.transport_mode || '', t.distance_km ?? '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllJson = async () => {
    const all: any[] = [];
    for (let p = 1; p <= 50; p++) {
      const params: any = { page: p };
      if (mode) params.mode = mode;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await tripsAPI.getTrips(params);
      const list = Array.isArray((res as any)?.results) ? (res as any).results : Array.isArray(res as any) ? (res as any) : [];
      if (!list.length) break;
      all.push(...list);
    }
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-all.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>🧭 All Trips</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField label="Mode" placeholder="walk/car/bus/cycle" value={mode} onChange={(e) => setMode(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="From (date)" type="date" value={from} onChange={(e) => setFrom(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="To (date)" type="date" value={to} onChange={(e) => setTo(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => { setPage(1); load(); }}>Apply</Button>
              <Button variant="outlined" onClick={exportJson}>Export JSON</Button>
              <Button variant="outlined" onClick={exportCsv}>Export CSV</Button>
              <Button variant="outlined" onClick={exportAllJson}>Export All (JSON)</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack spacing={1}>
        {items.map((t) => (
          <Paper key={t.id} sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1">Trip {t.id}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(t.start_time).toLocaleString()} • {t.transport_mode} • {Math.round(t.distance_km || 0)} km</Typography>
              </Box>
              <Button variant="outlined" onClick={() => window.location.assign(`/trips/${t.id}`)}>Open</Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <Chip label={`Page ${page}`} />
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </Stack>
    </Container>
  );
};

export default TripsListPage;
