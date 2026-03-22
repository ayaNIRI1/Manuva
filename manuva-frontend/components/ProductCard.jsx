'use client'
import { StarIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { assets } from '@/assets/assets'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlistAsync, removeFromWishlistAsync } from '@/lib/features/wishlist/wishlistSlice'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

import { useLanguage } from '@/lib/language-context'

const ProductCard = ({ product }) => {

    const { t, language } = useLanguage()
    const isAr = language === 'ar'
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || (isAr ? 'دج' : 'DZD')
    const dispatch = useDispatch()
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const wishlistIds = useSelector(state => state.wishlist.itemIds)
    const isFavorited = wishlistIds.includes(product.id)

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    
    // Better image resolution handling for both real and dummy data
    let imageUrl = assets.upload_placeholder;
    
    if (product.image_url) {
        imageUrl = product.image_url.startsWith('http') 
            ? product.image_url 
            : `${backendUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`;
    } else if (product.images && product.images.length > 0) {
        imageUrl = product.images[0];
    }

    const rating = product.avg_rating || 0;

    const toggleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (isFavorited) {
            dispatch(removeFromWishlistAsync(product.id))
        } else {
            dispatch(addToWishlistAsync(product.id))
        }
    }

    return (
        <div className='group max-xl:mx-auto block relative'>
            <Link href={`/product/${product.id}`}>
                <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-64 rounded-3xl flex items-center justify-center overflow-hidden relative border border-slate-100/50 shadow-sm transition-all hover:shadow-md'>
                    <Image 
                        width={500} 
                        height={500} 
                        className='h-full w-full object-cover group-hover:scale-110 transition duration-700' 
                        src={imageUrl} 
                        alt={product.name} 
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-foreground shadow-sm border border-slate-100 flex items-center gap-1.5 ">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 scale-in animate-pulse"></div>
                        {product.seller_name || t('artisan')}
                    </div>

                    <button 
                        onClick={toggleWishlist}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isFavorited ? 'bg-white text-brand-orange shadow-lg' : 'bg-white/80 text-brand-mauve hover:text-brand-orange hover:bg-white shadow-sm'}`}
                    >
                        <Heart size={18} fill={isFavorited ? "currentColor" : "none"} strokeWidth={isFavorited ? 0 : 2} />
                    </button>
                </div>
                <div className='flex justify-between items-start gap-3 text-sm text-foreground pt-3 px-1'>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-foreground">{product.name}</p>
                        <div className='flex items-center gap-1 mt-1'>
                            <div className='flex'>
                                {Array(5).fill('').map((_, index) => (
                                    <StarIcon key={index} size={12} className='text-transparent' fill={rating >= index + 1 ? "#FF9500" : "#E5E7EB"} />
                                ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{product.review_count || 0}</span>
                        </div>
                    </div>
                    <p className="font-extrabold text-brand-orange text-base">{isAr ? `${currency} ${product.price}` : `${product.price} ${currency}`}</p>
                </div>
            </Link>
        </div>
    )
}

export default ProductCard