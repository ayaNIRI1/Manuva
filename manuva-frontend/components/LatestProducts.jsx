'use client'
import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { apiRequest } from '@/lib/api'
import { setProduct } from '@/lib/features/product/productSlice'
import { useLanguage } from '@/lib/language-context'

const LatestProducts = () => {
    const dispatch = useDispatch()
    const displayQuantity = 4
    const products = useSelector(state => state.product.list)
    const { t } = useLanguage()

    const fetchLatestProducts = async () => {
        try {
            const data = await apiRequest('/products?limit=8&status=approved')
            if (data.products) {
                dispatch(setProduct(data.products))
            }
        } catch (error) {
            console.error('Fetch latest products error:', error)
        }
    }

    useEffect(() => {
        fetchLatestProducts()
    }, [])

    return (
        <div className='px-6 my-20 max-w-7xl mx-auto'>
            <Title title={t('latest_products')} description={t('showing_products', { count: products.length < displayQuantity ? products.length : displayQuantity, total: products.length })} href='/shop' />
            <div className='mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8'>
                {products.slice(0, 8).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts