'use client'
import { apiRequest } from "@/lib/api"
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'pending', 'approved'

    const fetchStores = async () => {
        try {
            const data = await apiRequest('/artisans/admin/all')
            setStores(data)
        } catch (error) {
            console.error('Fetch stores error:', error)
            toast.error("Failed to load stores")
        } finally {
            setLoading(false)
        }
    }

    const toggleVerification = async (storeId) => {
        try {
            const response = await apiRequest(`/artisans/${storeId}/verify`, { method: 'POST' })
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_verified: response.is_verified } : s))
            toast.success(response.message)
        } catch (error) {
            console.error('Toggle verification error:', error)
            toast.error("Failed to update status")
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    const filteredStores = stores.filter(store => {
        if (filter === 'pending') return !store.is_verified
        if (filter === 'approved') return store.is_verified
        return true
    })

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Stores</span></h1>
                
                <div className="flex bg-slate-100 p-1 rounded-lg self-start">
                    {['all', 'pending', 'approved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                                filter === f 
                                ? 'bg-white text-slate-900 shadow-sm font-medium' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {filteredStores.length ? (
                <div className="flex flex-col gap-4">
                    {filteredStores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2 flex-wrap ml-auto">
                                <div className="flex items-center gap-2 mr-4">
                                    <span className={`w-2 h-2 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-xs font-medium uppercase">{store.is_active ? 'Active' : 'Deactivated'}</span>
                                </div>
                                <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                                    <p className="text-sm font-medium text-slate-700">Approved</p>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            onChange={() => toggleVerification(store.id)} 
                                            checked={store.is_verified} 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-80 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <h1 className="text-2xl text-slate-400 font-medium text-center">No {filter !== 'all' ? filter : ''} stores found</h1>
                    <p className="text-slate-400 mt-2">Try adjusting your filters</p>
                </div>
            )
            }
        </div>
    ) : <Loading />
}