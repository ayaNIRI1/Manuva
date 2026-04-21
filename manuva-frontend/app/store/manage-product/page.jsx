'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { Trash2 } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { assets } from "@/assets/assets"
import { useLanguage } from "@/lib/language-context"

export default function StoreManageProducts() {
    const { language } = useLanguage()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
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

    const deleteProduct = async (productId) => {
        if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await apiRequest(`/products/${productId}`, {
                method: 'DELETE'
            })
            toast.success(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully')
            fetchProducts()
        } catch (error) {
            console.error('Delete product error:', error)
            toast.error(language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product')
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
            fetchProducts() // Revert changes on error
        }
    }

    const handleStockChange = (productId, newStock) => {
        setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p))
    }

    const updatePrice = async (productId, newPrice) => {
        try {
            await apiRequest(`/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ price: parseFloat(newPrice) })
            })
            toast.success(language === 'ar' ? 'تم تحديث السعر بنجاح' : 'Price updated successfully')
        } catch (error) {
            console.error('Update price error:', error)
            toast.error(language === 'ar' ? 'فشل تحديث السعر' : 'Failed to update price')
            fetchProducts() // Revert changes on error
        }
    }

    const handlePriceChange = (productId, newPrice) => {
        setProducts(products.map(p => p.id === productId ? { ...p, price: newPrice } : p))
    }

    const toggleStatus = async (productId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'approved' ? 'pending' : 'approved'
            await apiRequest(`/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            })
            toast.success('Status updated')
            fetchProducts()
        } catch (error) {
            console.error('Update status error:', error)
            toast.error('Failed to update status')
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">
                {language === 'ar' ? 'إدارة' : 'Manage'} <span className="text-brand-orange">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
            </h1>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المنتج' : 'Product'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">{language === 'ar' ? 'القسم' : 'Category'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'السعر' : 'Price'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">
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

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                                        <Image width={48} height={48} className='w-full h-full object-cover' src={imageUrl} alt={product.name} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-foreground truncate">{product.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium md:hidden">{product.category_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                                                    {product.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="font-extrabold text-brand-mauve mr-1">{currency}</span>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={product.price}
                                                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                        onBlur={(e) => updatePrice(product.id, e.target.value)}
                                                        title={language === 'ar' ? 'تعديل السعر' : 'Edit Price'}
                                                        className="w-24 px-2 py-1.5 text-left rounded-lg border-2 border-transparent hover:border-slate-200 focus:border-brand-mauve focus:ring-4 focus:ring-brand-mauve/10 transition-all font-extrabold text-brand-mauve bg-transparent focus:bg-white"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={product.stock}
                                                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                                                    onBlur={(e) => updateStock(product.id, e.target.value)}
                                                    title={language === 'ar' ? 'تعديل المخزون' : 'Edit Stock'}
                                                    className={`w-20 px-2 py-1.5 text-center rounded-lg border-2 transition-all font-bold ${product.stock > 0 ? 'border-slate-200 text-slate-700 focus:border-brand-mauve focus:ring-4 focus:ring-brand-mauve/10' : 'border-red-200 text-red-600 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                                        product.status === 'approved' ? 'bg-green-50 text-green-600' : 
                                                        product.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            product.status === 'approved' ? 'bg-green-500' : 
                                                            product.status === 'rejected' ? 'bg-red-500' : 
                                                            'bg-amber-500 animate-pulse'
                                                        }`}></div>
                                                        {product.status === 'approved' ? (language === 'ar' ? 'مقبول' : 'Approved') : 
                                                         product.status === 'rejected' ? (language === 'ar' ? 'مرفوض' : 'Rejected') : 
                                                         (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={language === 'ar' ? 'حذف' : 'Delete'}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
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