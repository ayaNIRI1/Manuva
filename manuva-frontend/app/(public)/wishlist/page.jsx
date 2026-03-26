'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import ProductCard from '@/components/ProductCard'
import Title from '@/components/Title'
import { Heart, shopping_cart_icon } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from '@/components/Loading'

const WishlistPage = () => {
    const { items, loading } = useSelector(state => state.wishlist)

    if (loading) return <Loading />

    return (
        <ProtectedRoute>
            <div className='max-w-7xl mx-auto px-6 py-10 min-h-[70vh]'>
                <div className='flex items-center justify-between mb-10'>
                <div className='flex flex-col gap-2'>
                    <Title text1={'MY'} text2={'WISHLIST'} />
                    <p className='text-sm text-slate-500 font-medium'>
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved in your favorites
                    </p>
                </div>
                <Link href='/shop' className='text-red-500 text-sm font-bold hover:underline flex items-center gap-2'>
                    Continue Shopping
                </Link>
            </div>

            {items.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200'>
                    <Heart size={40} className='text-red-100 mb-4' />
                    <h3 className='text-lg font-bold text-slate-400'>Your wishlist is empty</h3>
                    <p className='text-slate-400 text-sm mt-1 mb-6'>Explore products and tap the heart icon to save products here.</p>
                    <Link href='/shop' className='border border-slate-200 text-slate-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-white transition-all'>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 gap-y-10'>
                    {items.map((item) => (
                        <div key={item.id} className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
                            <ProductCard product={item} />
                        </div>
                    ))}
                </div>
            )}
            </div>
        </ProtectedRoute>
    );
}

export default WishlistPage
