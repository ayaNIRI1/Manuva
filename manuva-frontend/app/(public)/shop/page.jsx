'use client'
import { useEffect, useState, Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { apiRequest } from "@/lib/api"
import { setProduct } from "@/lib/features/product/productSlice"
import { useLanguage } from "@/lib/language-context"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const dispatch = useDispatch()
    const { t, language } = useLanguage()
    const [loading, setLoading] = useState(false)

    const products = useSelector(state => state.product.list)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const endpoint = search 
                ? `/products?search=${encodeURIComponent(search)}&status=approved`
                : '/products?status=approved'
            const data = await apiRequest(endpoint)
            if (data.products) {
                dispatch(setProduct(data.products))
            }
        } catch (error) {
            console.error('Fetch products error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [search])

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div 
                    onClick={() => router.push('/shop')} 
                    className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer group w-fit"
                > 
                    {search && <MoveLeftIcon size={20} className="group-hover:-translate-x-1 transition-transform" />}  
                    <span className="text-slate-400 font-light">{t('shop') || 'Store'}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-700 font-medium">
                        {search ? (language === 'ar' ? `نتائج البحث عن "${search}"` : `Search results for "${search}"`) : (t('all_products') || 'All Products')}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p>{language === 'ar' ? 'جاري البحث...' : 'Searching products...'}</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="text-center py-32">
                        <p className="text-slate-500 text-lg">
                            {language === 'ar' ? 'لم يتم العثور على منتجات تطابق بحثك.' : 'No products found matching your search.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}