'use client'
import Image from "next/image"
import { MapPin, Mail, Phone, CalendarIcon } from "lucide-react"
import { assets } from "@/assets/assets"

const StoreInfo = ({ store }) => {
    // Helper to format date safely
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString()
        } catch (e) {
            return 'N/A'
        }
    }

    return (
        <div className="flex-1 space-y-3 text-sm">
            <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm">
                    <Image 
                        fill
                        src={store.profile_img || assets.artisan_placeholder} 
                        alt={store.name} 
                        className="object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-800">{store.name}</h3>
                        <span
                            className={`text-[10px] uppercase tracking-wider font-bold px-3 py-0.5 rounded-full ${
                                store.is_verified
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                        >
                            {store.is_verified ? 'Verified' : 'Pending Approval'}
                        </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Mail size={14} className="text-slate-400" /> {store.email}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-4 pt-4 border-t border-slate-50">
                <p className="flex items-center gap-2 text-slate-600"> 
                    <MapPin size={16} className="text-orange-500/70" /> 
                    {store.location || 'No location provided'}
                </p>
                {store.phone && (
                    <p className="flex items-center gap-2 text-slate-600">
                        <Phone size={16} className="text-blue-500/70" /> 
                        {store.phone}
                    </p>
                )}
                <p className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon size={16} className="text-slate-400" />
                    Joined on {formatDate(store.created_at)}
                </p>
            </div>

            {store.bio && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-600 italic leading-relaxed">
                        "{store.bio}"
                    </p>
                </div>
            )}
            
            <div className="flex gap-4 mt-2 text-xs font-medium text-slate-500">
                <p><span className="text-slate-800">{store.product_count}</span> Products</p>
                <p><span className="text-slate-800">{store.follower_count}</span> Followers</p>
                <p><span className="text-slate-800">{Number(store.avg_rating).toFixed(1)}</span> Rating</p>
            </div>
        </div>
    )
}

export default StoreInfo