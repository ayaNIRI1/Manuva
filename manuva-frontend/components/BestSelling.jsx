'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { useLanguage } from '@/lib/language-context'

const BestSelling = () => {

    const { t } = useLanguage()
    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    return (
        <div className='px-6 my-20 max-w-7xl mx-auto'>
            <Title title={t('best_selling')} description={t('showing_products', { count: products.length < displayQuantity ? products.length : displayQuantity, total: products.length })} href='/shop' />
            <div className='mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8'>
                {products.slice().sort((a, b) => (b.review_count || 0) - (a.review_count || 0)).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling