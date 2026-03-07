'use client'

import { addToCartAsync } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, ArrowRight } from "lucide-react";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    // Better image resolution handling for both real and dummy data
    const getFullImageUrl = (img) => {
        if (!img) return assets.upload_placeholder;
        if (typeof img === 'string') {
            return img.startsWith('http') ? img : `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        }
        return img; // For imported static assets (dummy data)
    }

    const images = (product.images && product.images.length > 0) 
        ? product.images 
        : [product.image_url || assets.upload_placeholder];

    const [mainImage, setMainImage] = useState(images[0]);

    const addToCartHandler = () => {
        dispatch(addToCartAsync({ productId, quantity: 1 }))
    }

    const averageRating = product.rating?.length > 0 
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length 
        : (product.avg_rating || 0);
    
    const reviewCount = product.rating?.length || product.review_count || 0;

    const discountPercentage = (product.mrp && product.mrp > product.price) 
        ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0) 
        : null;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(images[index])} className="bg-slate-50 flex items-center justify-center size-26 rounded-3xl group cursor-pointer border border-slate-100/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <Image src={getFullImageUrl(image)} className="group-hover:scale-110 transition duration-500 w-full h-full object-cover" alt="" width={500} height={500} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden shadow-sm group">
                    <Image src={getFullImageUrl(mainImage)} alt="" width={1000} height={1000} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{product.name}</h1>
                <div className='flex items-center mt-3 gap-2'>
                    <div className="flex bg-slate-50 px-3 py-1 rounded-full border border-slate-100 items-center gap-1.5">
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={12} className='text-transparent' fill={averageRating >= index + 1 ? "#FF9500" : "#D1D5DB"} />
                        ))}
                    </div>
                    <p className="text-xs font-bold text-slate-400">{reviewCount} Reviews</p>
                </div>
                
                <div className="flex items-center my-8 gap-4">
                    <div className="flex flex-col">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                        <p className="text-4xl font-black text-brand-mauve"> {currency}{product.price} </p>
                    </div>
                    {product.mrp && product.mrp > product.price && (
                        <div className="flex flex-col">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 line-through">MRP</p>
                             <p className="text-xl text-slate-400 line-through font-bold">{currency}{product.mrp}</p>
                        </div>
                    )}
                </div>

                {discountPercentage && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-2xl border border-green-100 font-black text-xs mb-8">
                        <TagIcon size={14} />
                        <p>Save {discountPercentage}% right now</p>
                    </div>
                )}

                <div className="flex items-center gap-6 mt-4">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button 
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
                        className="flex-1 bg-slate-900 text-white px-12 py-5 text-sm font-black rounded-3xl shadow-xl shadow-slate-200 hover:bg-black hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <hr className="border-slate-100 my-10" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-orange">
                            <EarthIcon size={18} />
                        </div>
                        <p>Free shipping worldwide</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-orange">
                            <CreditCardIcon size={18} />
                        </div>
                        <p>100% Secured Payment</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-orange">
                            <UserIcon size={18} />
                        </div>
                        <p>Trusted by top brands</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails