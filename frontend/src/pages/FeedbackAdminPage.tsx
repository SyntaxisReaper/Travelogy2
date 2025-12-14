import React, { useEffect, useMemo, useState } from 'react';
import { Container, Paper, Typography, Box, Stack, Chip, CircularProgress } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { Auth } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';

interface FBItem {
  id: string;
  subject: string;
  message: string;
  user_email?: string | null;
  user_id?: string | null;
  created_at?: Timestamp | null;
}

const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const lc = email.toLowerCase();
  return lc.endsWith('@skystack.dev') || lc === 'admin@skystack.dev';
};

const FeedbackAdminPage: React.FC = () => {
  const [fbUser] = useAuthState(auth as Auth);
  const [items, setItems] = useState<FBItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  const allowed = isAdminEmail(fbUser?.email);

  useEffect(() => {
    if (!allowed || !db) { setLoading(false); return; }
    const q = query(collection(db, 'feedback'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: FBItem[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [allowed]);

  if (!allowed) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Feedback Admin</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2">Access denied. Admin account required.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Feedback Admin</Typography>
      <Paper sx={{ p: 3 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>
        )}
        {!loading && (!items || items.length === 0) && (
          <Typography variant="body2" color="text.secondary">No feedback yet.</Typography>
        )}
        <Stack spacing={2}>
          {(items || []).map((it) => (
            <Paper key={it.id} sx={{ p: 2 }} variant="outlined">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>{it.subject || '(no subject)'}</Typography>
                <Stack direction="row" spacing={1}>
                  {it.user_email && <Chip size="small" label={it.user_email} />}
                  {it.created_at && <Chip size="small" label={it.created_at.toDate().toLocaleString()} />}
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{it.message}</Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default FeedbackAdminPage;
