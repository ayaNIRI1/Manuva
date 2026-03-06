'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { apiRequest } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

export default function StoreAddProduct() {
    const { language } = useLanguage()
    const router = useRouter()
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        price: "",
        stock: "10",
        category_id: "",
    })
    const [loading, setLoading] = useState(false)

    const fetchCategories = async () => {
        try {
            const data = await apiRequest('/categories')
            setCategories(data)
        } catch (error) {
            console.error('Fetch categories error:', error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('price', productInfo.price)
            formData.append('stock', productInfo.stock)
            formData.append('category_id', productInfo.category_id)

            // Append images
            Object.values(images).forEach(file => {
                if (file) {
                    formData.append('images', file)
                }
            })

            await apiRequest('/products', {
                method: 'POST',
                body: formData,
                isFormData: true
            })

            toast.success(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully')
            router.push('/store/manage-product')
        } catch (error) {
            console.error('Add product error:', error)
            toast.error(error.message || 'Failed to add product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">
                {language === 'ar' ? 'إضافة' : 'Add New'} <span className="text-brand-orange">{language === 'ar' ? 'منتج جديد' : 'Product'}</span>
            </h1>

            <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <section>
                    <p className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">{language === 'ar' ? 'صور المنتج' : 'Product Images'}</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {Object.keys(images).map((key) => (
                            <label key={key} htmlFor={`images${key}`} className="relative group flex-shrink-0">
                                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-white hover:border-brand-mauve/50 transition-all cursor-pointer overflow-hidden">
                                    {images[key] ? (
                                        <Image width={150} height={150} className='w-full h-full object-cover' src={URL.createObjectURL(images[key])} alt="" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-brand-mauve transition-colors">
                                            <Image width={40} height={40} src={assets.upload_placeholder} alt="" className="opacity-40" />
                                            <span className="text-[10px] font-bold">{language === 'ar' ? 'رفع' : 'Upload'}</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                            </label>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-800">{language === 'ar' ? 'اسم المنتج' : 'Product Name'}</span>
                        <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder={language === 'ar' ? 'أدخل اسم المنتج' : "Enter product name"} className="w-full p-3.5 bg-slate-50 outline-none border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-mauve/30 transition-all" required />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-800">{language === 'ar' ? 'القسم' : 'Category'}</span>
                        <select onChange={e => setProductInfo({ ...productInfo, category_id: e.target.value })} value={productInfo.category_id} className="w-full p-3.5 bg-slate-50 outline-none border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-mauve/30 transition-all" required>
                            <option value="">{language === 'ar' ? 'اختر قسماً' : 'Select a category'}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-800">{language === 'ar' ? 'الوصف' : 'Description'}</span>
                    <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder={language === 'ar' ? 'اشرح ميزات منتجك...' : "Tell buyers about your product..."} rows={4} className="w-full p-3.5 bg-slate-50 outline-none border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-mauve/30 transition-all resize-none" required />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-800">{language === 'ar' ? 'السعر' : 'Price'} ({process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'})</span>
                        <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0.00" className="w-full p-3.5 bg-slate-50 outline-none border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-mauve/30 transition-all" required />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-800">{language === 'ar' ? 'الكمية المتوفرة' : 'Stock Quantity'}</span>
                        <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="0" className="w-full p-3.5 bg-slate-50 outline-none border border-slate-100 rounded-2xl focus:bg-white focus:border-brand-mauve/30 transition-all" required />
                    </label>
                </div>

                <button 
                    type="submit"
                    disabled={loading} 
                    className="w-full bg-brand-mauve text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-mauve/20 hover:shadow-brand-mauve/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            {language === 'ar' ? 'نشر المنتج' : 'Publish Product'}
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}