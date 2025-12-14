import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Grid, TextField, Stack, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { ShoppingCart, Store, Add } from '@mui/icons-material';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';
import { storesAPI } from '../services/api';

interface Store { id: string; name: string; items: { id: string; name: string; price: number }[] }

const StoresPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [cart, setCart] = useState<Array<{ store_id: string; item_id: string; name: string; price: number; qty: number }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await storesAPI.getStores({ q });
        setStores(Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : []);
      } catch (e) {
        setStores([]);
      }
    };
    load();
  }, [q]);

  const addToCart = (s: Store, it: Store['items'][number]) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.item_id === it.id && x.store_id === s.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { store_id: s.id, item_id: it.id, name: it.name, price: it.price, qty: 1 }];
    });
  };

  const total = useMemo(() => cart.reduce((sum, x) => sum + x.price * x.qty, 0), [cart]);

  const checkout = async () => {
    try {
      const payload = { items: cart.map(({ store_id, item_id, qty }) => ({ store_id, item_id, qty })) };
      const res = await storesAPI.checkout(payload);
      alert(`Order placed: ${res.order_id || 'OK'}`);
      setCart([]);
    } catch (e) {
      alert('Checkout failed');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.coral}08 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}12 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '6%',
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${travelColors.primary.ocean}10 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <Store sx={{ fontSize: 40, color: travelColors.primary.coral, mr: 2 }} />
            <TravelText
              text="Local Travel Stores"
              textVariant="adventure"
              animated
              variant="h3"
            />
          </Box>

          <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Search & Cart"
                textVariant="gradient"
                variant="h6"
                sx={{ mb: 3 }}
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Search items or stores" 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    fullWidth 
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: travelColors.primary.coral,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: travelColors.primary.coral,
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: travelColors.primary.coral,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip 
                      label={`Cart: ${cart.length} items`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.ocean}20`,
                        color: travelColors.primary.ocean,
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip 
                      label={`Total: $${total.toFixed(2)}`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.forest}20`,
                        color: travelColors.primary.forest,
                        fontWeight: 'bold'
                      }}
                    />
                    <AdventureButton 
                      buttonVariant="coral" 
                      startIcon={<ShoppingCart />}
                      onClick={checkout} 
                      disabled={!cart.length}
                      adventure
                    >
                      Checkout
                    </AdventureButton>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </TravelCard>

          <Grid container spacing={3}>
            {stores.map((s) => (
              <Grid item xs={12} md={6} key={s.id}>
                <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
                  <Box sx={{ p: 3 }}>
                    <TravelText
                      text={s.name}
                      textVariant="wanderlust"
                      variant="h6"
                      sx={{ mb: 2 }}
                    />
                    <Divider sx={{ mb: 2, borderColor: `${travelColors.primary.coral}30` }} />
                    <Stack spacing={2}>
                      {s.items.map((it) => (
                        <Stack key={it.id} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                          <Typography 
                            variant="body1"
                            sx={{ 
                              color: travelColors.text.primary,
                              fontWeight: 500
                            }}
                          >
                            {it.name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                              label={`$${it.price}`} 
                              sx={{ 
                                backgroundColor: `${travelColors.primary.sunset}20`,
                                color: travelColors.primary.sunset,
                                fontWeight: 'bold'
                              }}
                            />
                            <AdventureButton 
                              size="small" 
                              buttonVariant="ocean"
                              startIcon={<Add />}
                              onClick={() => addToCart(s, it)}
                            >
                              Add
                            </AdventureButton>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </TravelCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default StoresPage;
