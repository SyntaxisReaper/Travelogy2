import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripsAPI } from '../../services/api';

interface Trip {
  id: string;
  start_time: string;
  end_time?: string;
  transport_mode: string;
  purpose: string;
  distance_km: number;
  carbon_footprint: number;
}

interface TripsState {
  trips: Trip[];
  activeTrip: Trip | null;
  stats: any;
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  activeTrip: null,
  stats: null,
  loading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await tripsAPI.getTrips(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trips');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'trips/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripsAPI.getStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.results || action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, setActiveTrip } = tripsSlice.actions;
export default tripsSlice.reducer;