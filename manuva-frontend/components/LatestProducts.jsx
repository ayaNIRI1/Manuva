import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { apiRequest } from '@/lib/api'
import { setProduct } from '@/lib/features/product/productSlice'

const LatestProducts = () => {

    const dispatch = useDispatch()
    const displayQuantity = 4
    const products = useSelector(state => state.product.list)

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
            <Title title='Latest Products' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8'>
                {products.slice(0, 8).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts