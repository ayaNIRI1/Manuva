'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { PackageIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { assets } from "@/assets/assets"
import { useLanguage } from "@/lib/language-context"

export default function StoreManageStock() {
    const { language } = useLanguage()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const data = await apiRequest('/products/artisan-list')
            setProducts(data)
        } catch (error) {
            console.error('Fetch artisan products error:', error)
            toast.error('Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }

    const updateStock = async (productId, newStock) => {
        try {
            await apiRequest(`/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ stock: parseInt(newStock) })
            })
            toast.success(language === 'ar' ? 'تم تحديث المخزون' : 'Stock updated successfully')
        } catch (error) {
            console.error('Update stock error:', error)
            toast.error(language === 'ar' ? 'فشل تحديث المخزون' : 'Failed to update stock')
            fetchProducts()
        }
    }

    const handleStockChange = (productId, newStock) => {
        setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p))
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4 flex items-center gap-3">
                <PackageIcon size={32} className="text-brand-orange" />
                <span>{language === 'ar' ? 'إدارة' : 'Manage'} <span className="text-brand-orange">{language === 'ar' ? 'المخزون' : 'Stock'}</span></span>
            </h1>
            <p className="text-slate-500 mb-8 text-sm">
                {language === 'ar' 
                    ? 'قم بتحديث كميات المنتجات الخاصة بك بسرعة لضمان توفرها لعملائك.' 
                    : 'Quickly update your product quantities to ensure they are available for your customers.'}
            </p>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المنتج' : 'Product'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{language === 'ar' ? 'المخزون الحالي' : 'Current Stock'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-20 text-center text-slate-400 font-medium">
                                        {language === 'ar' ? 'لا توجد منتجات بعد' : 'No products found yet'}
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const imageUrl = product.image_url 
                                        ? (product.image_url.startsWith('http') 
                                            ? product.image_url 
                                            : `${backendUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`)
                                        : assets.upload_placeholder;

                                    const isLowStock = product.stock <= 5 && product.stock > 0;
                                    const isOutOfStock = product.stock <= 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                                        <Image width={56} height={56} className='w-full h-full object-cover' src={imageUrl} alt={product.name} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-base">{product.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{product.category_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isOutOfStock ? (
                                                    <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-3 py-1 rounded-full w-fit">
                                                        <AlertTriangleIcon size={14} />
                                                        {language === 'ar' ? 'نفذ المخزون' : 'Out of Stock'}
                                                    </div>
                                                ) : isLowStock ? (
                                                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full w-fit">
                                                        <AlertTriangleIcon size={14} />
                                                        {language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full w-fit">
                                                        <CheckCircle2Icon size={14} />
                                                        {language === 'ar' ? 'متوفر' : 'In Stock'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center flex-col items-center gap-1">
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        value={product.stock}
                                                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                                                        onBlur={(e) => updateStock(product.id, e.target.value)}
                                                        className={`w-24 px-4 py-2 text-center rounded-xl border-2 transition-all font-black text-lg ${
                                                            isOutOfStock ? 'border-red-500 bg-red-50 text-red-700 shadow-sm focus:ring-red-500/10' :
                                                            isLowStock ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm focus:ring-amber-500/10' :
                                                            'border-slate-200 text-slate-700 focus:border-brand-mauve focus:ring-4 focus:ring-brand-mauve/10'
                                                        }`}
                                                    />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                        {language === 'ar' ? 'انقر للتعديل' : 'Click to edit'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
