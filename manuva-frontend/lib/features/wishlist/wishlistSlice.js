import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiRequest } from '@/lib/api'

// Async Thunks
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            return await apiRequest('/user/favorites');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToWishlistAsync = createAsyncThunk(
    'wishlist/addToWishlistAsync',
    async (productId, { rejectWithValue }) => {
        try {
            await apiRequest(`/user/favorites/${productId}`, {
                method: 'POST'
            });
            return productId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromWishlistAsync = createAsyncThunk(
    'wishlist/removeFromWishlistAsync',
    async (productId, { rejectWithValue }) => {
        try {
            await apiRequest(`/user/favorites/${productId}`, {
                method: 'DELETE'
            });
            return productId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],     // Array of product objects
        itemIds: [],    // Array of just product IDs for quick lookups
        loading: false,
        error: null,
    },
    reducers: {
        clearWishlist: (state) => {
            state.items = []
            state.itemIds = []
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => { state.loading = true })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload || []
                state.itemIds = (action.payload || []).map(item => item.id)
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Add Async
            .addCase(addToWishlistAsync.fulfilled, (state, action) => {
                if (!state.itemIds.includes(action.payload)) {
                    state.itemIds.push(action.payload)
                    // Note: items array might be incomplete until next fetchWishlist
                    // but itemIds is enough for the heart toggles
                }
            })
            // Remove Async
            .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
                state.itemIds = state.itemIds.filter(id => id !== action.payload)
                state.items = state.items.filter(item => item.id !== action.payload)
            });
    }
})

export const { clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
