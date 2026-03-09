'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon, MessageCircle, UserPlus, UserMinus, Users } from "lucide-react"
import Loading from "@/components/Loading"
import { useChat } from "@/lib/chat-context"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { dummyStoreData, productDummyData } from "@/assets/assets"
import { apiRequest } from "@/lib/api"
import toast from "react-hot-toast"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followerCount, setFollowerCount] = useState(0)
    const { startConversation, setIsChatOpen } = useChat()
    const { user, isAuthenticated } = useAuth()

    const handleStartChat = async () => {
        if (!storeInfo?.id) return;
        const conv = await startConversation(storeInfo.id);
        if (conv) setIsChatOpen(true);
    }

    const handleToggleFollow = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to follow stores");
            return;
        }
        if (user.id === storeInfo.id) {
            toast.error("You cannot follow your own store");
            return;
        }

        try {
            if (isFollowing) {
                await apiRequest(`/user/following/${storeInfo.id}`, { method: 'DELETE' });
                setIsFollowing(false);
                setFollowerCount(prev => prev - 1);
                toast.success("Unfollowed store");
            } else {
                await apiRequest(`/user/following/${storeInfo.id}`, { method: 'POST' });
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
                toast.success("Following store");
            }
        } catch (error) {
            console.error("Follow toggle error:", error);
            toast.error("Action failed");
        }
    }

    const fetchStoreData = async () => {
        try {
            const store = await apiRequest(`/artisans/${username}`);
            const storeProducts = await apiRequest(`/artisans/${username}/products`);
            
            setStoreInfo({
                id: store.id,
                name: store.name,
                description: store.bio,
                logo: store.profile_img || '/images/default-store.jpg',
                address: store.location,
                email: store.email || 'contact@artisan.com'
            });
            setProducts(storeProducts);
            setFollowerCount(parseInt(store.follower_count) || 0);

            // Check if following
            if (isAuthenticated && store.id) {
                const followData = await apiRequest(`/user/following/${store.id}/check`);
                setIsFollowing(followData.is_following);
            }
        } catch (error) {
            console.error("Failed to fetch store data:", error);
            setStoreInfo(dummyStoreData);
            setProducts(productDummyData);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (username) {
            fetchStoreData()
        }
    }, [username, isAuthenticated])

    return !loading ? (
        <div className="min-h-[70vh] mx-6">

            {/* Store Info Banner */}
            {storeInfo && (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                        width={200}
                        height={200}
                    />
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                                <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <button 
                                    onClick={handleToggleFollow}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg ${
                                        isFollowing 
                                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                                        : "bg-primary text-primary-foreground hover:opacity-90"
                                    }`}
                                >
                                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                    {isFollowing ? "إلغاء المتابعة" : "متابعة"}
                                </button>

                                <button 
                                    onClick={handleStartChat}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-br from-brand-orange to-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    <MessageCircle size={18} />
                                    محادثة
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Users size={16} className="text-primary" />
                                <span className="text-slate-800 font-bold">{followerCount}</span>
                                <span>متابع</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon size={16} className="text-slate-400" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MailIcon size={16} className="text-slate-400" />
                                <span>{storeInfo.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className=" max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    ) : <Loading />
}