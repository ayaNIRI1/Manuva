'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { Sparkles, Store, MapPin, Phone, Info, Tag } from "lucide-react"

export default function CreateStore() {
    const { user, updateUser, isAuthenticated } = useAuth()
    const { t, language } = useLanguage()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: user?.name || "",
        bio: user?.bio || "",
        location: user?.location || "",
        phone: user?.phone || "",
        image: null
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/create-store')
        } else if (user?.role === 'artisan') {
            router.push('/store')
        }
    }, [isAuthenticated, user, router])

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await apiRequest('/auth/become-artisan', {
                method: 'POST',
                body: JSON.stringify({
                    name: storeInfo.name,
                    bio: storeInfo.bio,
                    location: storeInfo.location,
                    phone: storeInfo.phone
                })
            })

            // Update local auth context with new role and token
            updateUser(response.user)
            if (response.token) {
                localStorage.setItem('token', response.token)
            }

            toast.success(language === 'ar' ? 'مبارك! أصبحت حرفياً الآن' : 'Congratulations! You are now an artisan')
            
            // Short delay to show success toast then redirect
            setTimeout(() => {
                router.push('/store')
            }, 1500)

        } catch (err) {
            toast.error(err.message)
            setIsSubmitting(false)
        }
    }

    if (!user || user.role === 'artisan') return <Loading />

    return (
        <div className="min-h-screen bg-background selection:bg-brand-mauve/20">
            <div className="max-w-4xl mx-auto py-16 px-6">
                <div className="bg-surface rounded-[2.5rem] border border-border shadow-2xl shadow-brand-mauve/5 overflow-hidden">
                    {/* Header Image/Pattern */}
                    <div className="h-48 bg-gradient-to-br from-brand-mauve via-brand-pink to-brand-blush relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                            <Sparkles size={200} className="text-white rotate-12" />
                        </div>
                        <div className="absolute bottom-6 left-8 flex items-center gap-4 text-white">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <Store size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">{t('become_artisan')}</h1>
                                <p className="text-white/80 font-medium">{t('store_setup')}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={onSubmitHandler} className="p-8 sm:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Store Name */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                                    <Tag size={16} className="text-brand-mauve" />
                                    {t('store_name')}
                                </label>
                                <input 
                                    name="name" 
                                    required
                                    onChange={onChangeHandler} 
                                    value={storeInfo.name} 
                                    type="text" 
                                    placeholder={language === 'ar' ? "أدخل اسم متجرك" : "Enter your store name"} 
                                    className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all font-medium" 
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                                    <Phone size={16} className="text-brand-mauve" />
                                    {language === 'ar' ? "رقم الهاتف" : "Phone Number"}
                                </label>
                                <input 
                                    name="phone" 
                                    required
                                    onChange={onChangeHandler} 
                                    value={storeInfo.phone} 
                                    type="text" 
                                    placeholder={language === 'ar' ? "06XXXXXXXX" : "06XXXXXXXX"} 
                                    className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all font-medium" 
                                />
                            </div>
                        </div>

                        {/* Store Description/Bio */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                                <Info size={16} className="text-brand-mauve" />
                                {t('store_description')}
                            </label>
                            <textarea 
                                name="bio" 
                                required
                                onChange={onChangeHandler} 
                                value={storeInfo.bio} 
                                rows={4} 
                                placeholder={language === 'ar' ? "أخبرنا عن عملك الحرفي وما يميزك..." : "Tell us about your craft and what makes you unique..."} 
                                className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all resize-none font-medium" 
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                                <MapPin size={16} className="text-brand-mauve" />
                                {t('location')}
                            </label>
                            <input 
                                name="location" 
                                required
                                onChange={onChangeHandler} 
                                value={storeInfo.location} 
                                type="text" 
                                placeholder={language === 'ar' ? "مثال: مراكش، المدينة العتيقة" : "e.g. Marrakech, Old Medina"} 
                                className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all font-medium" 
                            />
                        </div>

                        <div className="pt-6">
                            <button 
                                disabled={isSubmitting}
                                className="w-full py-5 bg-brand-mauve text-white rounded-[2rem] font-extrabold text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-brand-mauve/20 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-brand-mauve/10"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Sparkles size={20} />
                                )}
                                {isSubmitting ? (language === 'ar' ? 'جاري التحويل...' : 'Upgrading...') : (language === 'ar' ? 'تفعيل حسابي كحرفي' : 'Activate My Artisan Account')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}