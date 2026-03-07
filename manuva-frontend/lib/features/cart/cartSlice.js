import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiRequest } from '@/lib/api'

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (token, { rejectWithValue }) => {
        try {
            const data = await apiRequest('/orders/cart', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            return await apiRequest('/orders/cart', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId, quantity })
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async ({ productId }, { rejectWithValue }) => {
        try {
            console.log('cartSlice: removing product from cart:', productId);
            const data = await apiRequest(`/orders/cart/${productId}`, {
                method: 'DELETE'
            });
            console.log('cartSlice: removeFromCart success:', data);
            return data;
        } catch (error) {
            console.error('cartSlice: removeFromCart error:', error);
            return rejectWithValue(error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {}, // Keep for backward compatibility/quick UI updates
        items: [],     // Backend sync items
        loading: false,
        error: null,
        orderId: null,
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            state.cartItems[productId] = (state.cartItems[productId] || 0) + 1;
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) delete state.cartItems[productId]
                state.total -= 1
            }
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] || 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.items = []
            state.total = 0
            state.orderId = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => { state.loading = true })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.id) {
                    state.orderId = action.payload.id;
                    state.items = action.payload.items || [];
                    const newCartItems = {};
                    let newTotal = 0;
                    state.items.forEach(item => {
                        newCartItems[item.product_id] = item.quantity;
                        newTotal += item.quantity;
                    });
                    state.cartItems = newCartItems;
                    state.total = newTotal;
                } else {
                    // Reset to empty if no active cart order found
                    state.orderId = null;
                    state.items = [];
                    state.cartItems = {};
                    state.total = 0;
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Async
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                const cart = action.payload.cart;
                if (cart) {
                    if (cart.id === null) {
                        state.orderId = null;
                        state.items = [];
                        state.cartItems = {};
                        state.total = 0;
                    } else {
                        state.orderId = cart.id;
                        const cleanItems = (cart.items || []).filter(item => item && (item.id || item.product_id));
                        state.items = cleanItems;
                        const newCartItems = {};
                        let newTotal = 0;
                        cleanItems.forEach(item => {
                            newCartItems[item.product_id] = item.quantity;
                            newTotal += item.quantity;
                        });
                        state.cartItems = newCartItems;
                        state.total = newTotal;
                    }
                }
            })
            // Remove Async
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                const cart = action.payload.cart;
                if (cart) {
                    if (cart.id === null) {
                        state.orderId = null;
                        state.items = [];
                        state.cartItems = {};
                        state.total = 0;
                    } else {
                        state.orderId = cart.id;
                        const cleanItems = (cart.items || []).filter(item => item && (item.id || item.product_id));
                        state.items = cleanItems;
                        const newCartItems = {};
                        let newTotal = 0;
                        cleanItems.forEach(item => {
                            newCartItems[item.product_id] = item.quantity;
                            newTotal += item.quantity;
                        });
                        state.cartItems = newCartItems;
                        state.total = newTotal;
                    }
                } else {
                    const productId = action.meta.arg.productId;
                    if (state.cartItems[productId]) {
                        state.total -= state.cartItems[productId];
                        delete state.cartItems[productId];
                    }
                    state.items = state.items.filter(item => item.product_id !== productId);
                }
            });
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions
export default cartSlice.reducer
