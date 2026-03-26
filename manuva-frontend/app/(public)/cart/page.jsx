'use client'
import Counter from "@/components/Counter";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { fetchCart, removeFromCartAsync } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    
    const { items, cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        // Prefer items from backend sync as they are self-contained
        if (items && items.length > 0) {
            let total = 0;
            const formattedItems = items.map(item => {
                total += item.price_at_purchase * item.quantity;
                return {
                    id: item.product_id,
                    name: item.product_name,
                    image_url: item.product_image,
                    price: item.price_at_purchase,
                    quantity: item.quantity,
                    category: '' // Category might not be in cart response
                };
            });
            setTotalPrice(total);
            setCartArray(formattedItems);
        } else {
            // Fallback to finding in product list (legacy)
            setTotalPrice(0);
            const legacyArray = [];
            for (const [key, value] of Object.entries(cartItems)) {
                const product = products.find(p => p.id === key);
                if (product) {
                    legacyArray.push({ ...product, quantity: value });
                    setTotalPrice(prev => prev + product.price * value);
                }
            }
            setCartArray(legacyArray);
        }
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(removeFromCartAsync({ productId }))
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

    const getFullImageUrl = (img) => {
        if (!img) return '/placeholder.png';
        if (typeof img === 'string') {
            return img.startsWith('http') ? img : `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        }
        return img;
    }

    useEffect(() => {
        createCartArray();
    }, [items, cartItems, products]);

    return (
        <ProtectedRoute>
            {cartArray.length > 0 ? (
                <div className="min-h-screen mx-6 text-foreground">

            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th className="max-md:hidden">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cartArray.map((item, index) => (
                                    <tr key={index} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md overflow-hidden p-1">
                                                <Image src={getFullImageUrl(item.image_url || item.images?.[0])} className="h-full w-full object-cover rounded-sm" alt="" width={60} height={60} />
                                            </div>
                                            <div>
                                                <p className="max-sm:text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                                <p>{currency}{item.price}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.id} />
                                        </td>
                                        <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItemFromCart(item.id)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
            )}
        </ProtectedRoute>
    );
}