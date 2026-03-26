'use client'
import { addToCartAsync } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const Counter = ({ productId }) => {

    const { cartItems } = useSelector(state => state.cart);

    const dispatch = useDispatch();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const addToCartHandler = () => {
        if (!isAuthenticated) return router.push('/login');
        dispatch(addToCartAsync({ productId, quantity: 1 }))
    }

    const removeFromCartHandler = () => {
        if (!isAuthenticated) return router.push('/login');
        dispatch(addToCartAsync({ productId, quantity: -1 }))
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[productId]}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter