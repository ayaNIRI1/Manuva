'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/lib/auth-context'
import { fetchCart } from '@/lib/features/cart/cartSlice'
import { fetchWishlist } from '@/lib/features/wishlist/wishlistSlice'

export default function CartInitializer() {
    const dispatch = useDispatch()
    const { isAuthenticated, loading, getToken } = useAuth()

    useEffect(() => {
        const initData = async () => {
            if (!loading && isAuthenticated) {
                const token = await getToken()
                dispatch(fetchCart(token))
                dispatch(fetchWishlist())
            }
        }
        initData()
    }, [dispatch, isAuthenticated, loading, getToken])

    return null // This component doesn't render anything
}
