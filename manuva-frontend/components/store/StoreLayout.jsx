'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

const StoreLayout = ({ children }) => {
    const { user, loading: authLoading, isAuthenticated } = useAuth()
    const { language } = useLanguage()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            setLoading(false)
        }
    }, [authLoading])

    return loading ? (
        <Loading />
    ) : isAuthenticated && (user?.role === 'artisan' || user?.role === 'admin') ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={user} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                {language === 'ar' ? 'غير مصرح لك بالوصول لهذه الصفحة' : 'You are not authorized to access this page'}
            </h1>
            <Link href="/" className="bg-brand-mauve text-white flex items-center gap-2 mt-8 p-3 px-8 max-sm:text-sm rounded-full shadow-lg hover:shadow-brand-mauve/20 transition-all font-bold">
                {language === 'ar' ? 'العودة للرئيسية' : 'Go to home'} <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout