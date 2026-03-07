'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon, MessageCircle } from "lucide-react"
import Loading from "@/components/Loading"
import { useChat } from "@/lib/chat-context"
import Image from "next/image"
import { dummyStoreData, productDummyData } from "@/assets/assets"
import { apiRequest } from "@/lib/api"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const { startConversation, setIsChatOpen } = useChat()

    const handleStartChat = async () => {
        if (!storeInfo?.id) return;
        const conv = await startConversation(storeInfo.id);
        if (conv) setIsChatOpen(true);
    }

    const fetchStoreData = async () => {
        try {
            // In a real app, we might search by name, but here we'll assume the username is the ID for now
            // or we'd have an endpoint to get by username.
            // Since the current backend uses ID, let's try to get by ID if it's a UUID, 
            // otherwise we'd need a "get artisan by name" endpoint.
            const store = await apiRequest(`/artisans/${username}`);
            const storeProducts = await apiRequest(`/artisans/${username}/products`);
            
            setStoreInfo({
                id: store.id,
                name: store.name,
                description: store.bio,
                logo: store.profile_img || '/images/default-store.jpg',
                address: store.location,
                email: store.email || 'contact@artisan.com' // email might need to be added to public artisan response
            });
            setProducts(storeProducts);
        } catch (error) {
            console.error("Failed to fetch store data:", error);
            // Fallback to dummy data for demonstration if API fails or user not found
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
    }, [username])

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
                            
                            <button 
                                onClick={handleStartChat}
                                className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                                <MessageCircle size={18} />
                                محادثة
                            </button>
                        </div>
                        <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
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