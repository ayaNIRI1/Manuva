'use client'
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, Users, User, MapPin } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

export default function Dashboard() {
    const { language } = useLanguage()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('analytics') // 'analytics' or 'followers'
    const [followers, setFollowers] = useState([])
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
        stats: {}
    })

    const dashboardCardsData = [
        { title: language === 'ar' ? 'إجمالي المنتجات' : 'Total Products', value: dashboardData.stats?.approved_products || 0, icon: ShoppingBasketIcon },
        { title: language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings', value: (dashboardData.stats?.total_revenue || 0) + ' ' + currency, icon: CircleDollarSignIcon },
        { title: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: dashboardData.recent_orders?.length || 0, icon: TagsIcon },
        { title: language === 'ar' ? 'المتابعون' : 'Followers', value: dashboardData.stats?.total_followers || 0, icon: Users, onClick: () => setActiveTab('followers') },
    ]

    const fetchDashboardData = async () => {
        try {
            const data = await apiRequest('/artisans/dashboard/analytics');
            setDashboardData({
                ...data,
                totalProducts: data.stats?.total_products || 0,
                totalEarnings: data.stats?.total_revenue || 0,
                totalOrders: data.recent_orders?.length || 0,
                ratings: data.recent_reviews?.map(review => ({
                    id: review.id,
                    rating: review.rating,
                    review: review.review,
                    createdAt: review.createdAt,
                    product: {
                        id: review.product_id,
                        name: review.product_name,
                        image: review.product_image,
                        category: review.category || 'Product'
                    },
                    user: {
                        name: review.user_name || 'Customer',
                        image: review.user_image || '/images/default-avatar.png'
                    }
                })) || []
            });

            const followersData = await apiRequest('/artisans/dashboard/followers');
            setFollowers(followersData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-10">
                {language === 'ar' ? 'لوحة تحكم' : 'Artisan'} <span className="text-brand-orange">{language === 'ar' ? 'الحرفي' : 'Dashboard'}</span>
            </h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div 
                            key={index} 
                            onClick={card.onClick}
                            className={`flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-xl hover:shadow-md transition-all ${card.onClick ? 'cursor-pointer hover:border-brand-orange/30' : ''}`}
                        >
                            <div className="flex flex-col gap-3 text-xs">
                                <p className="font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
                                <b className="text-2xl font-bold text-slate-800">{card.value}</b>
                            </div>
                            <card.icon size={50} className="w-12 h-12 p-2.5 text-slate-500 bg-slate-50 rounded-2xl" />
                        </div>
                    ))
                }
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'analytics' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {language === 'ar' ? 'التحليلات والمراجعات' : 'Analytics & Reviews'}
                </button>
                <button 
                    onClick={() => setActiveTab('followers')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'followers' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {language === 'ar' ? 'المتابعون' : 'Followers'}
                </button>
            </div>

            {activeTab === 'analytics' ? (
                <>
                <h2 className="text-xl font-bold text-slate-800 mb-6">{language === 'ar' ? 'إجمالي المراجعات' : 'Total Reviews'}</h2>
                <div className="grid grid-cols-1 gap-6">
                    {
                        dashboardData.ratings.length > 0 ? (
                            dashboardData.ratings.map((review, index) => (
                                <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-sm group hover:shadow-md transition-all">
                                    <div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden relative shadow-inner">
                                                <Image src={review.user.image?.startsWith('http') ? review.user.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${review.user.image?.startsWith('/') ? '' : '/'}${review.user.image}`} alt={review.user.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800">{review.user.name}</p>
                                                    <div className='flex items-center'>
                                                        {Array(5).fill('').map((_, index) => (
                                                            <StarIcon key={index} size={14} className='mt-0.5' fill={review.rating >= index + 1 ? "#F59E0B" : "#E5E7EB"} stroke="none" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium text-slate-400">{new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xl">{review.review || 'No comment provided.'}</p>
                                    </div>
                                    <div className="flex flex-col justify-between gap-4 sm:items-end">
                                        <div className="flex flex-col sm:items-end">
                                            <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-1">{review.product?.category}</span>
                                            <p className="font-bold text-slate-800 text-right">{review.product?.name}</p>
                                        </div>
                                        <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-brand-orange/10 text-brand-orange px-6 py-2 hover:bg-brand-orange hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 border border-brand-orange/20">
                                            {language === 'ar' ? 'عرض المنتج' : 'View Product'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400">{language === 'ar' ? 'لا توجد مراجعات بعد.' : 'No reviews yet.'}</p>
                            </div>
                        )
                    }
                </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{language === 'ar' ? 'قائمة المتابعين' : 'Followers List'}</h2>
                    {followers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {followers.map((follower) => (
                                <div key={follower.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-slate-50 flex items-center justify-center">
                                        {follower.profile_img ? (
                                            <img src={follower.profile_img} alt={follower.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={30} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{follower.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                                            <Users size={12} />
                                            {language === 'ar' ? 'يتابع منذ ' : 'Followed '}
                                            {new Date(follower.followed_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                             <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={40} className="text-slate-200" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-400">{language === 'ar' ? 'ليس لديك متابعون بعد' : 'No followers yet'}</h4>
                            <p className="text-slate-400 mt-2">{language === 'ar' ? 'سيظهر متابعوك هنا بمجرد أن يبدأ الناس في متابعة متجرك.' : 'Your followers will appear here once people start following your store.'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}