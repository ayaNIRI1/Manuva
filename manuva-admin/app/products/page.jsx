'use client'
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import Loading from "@/components/Loading"
import Image from "next/image"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [error, setError] = useState(null)

    const fetchProducts = async (status = filter) => {
        setLoading(true)
        try {
            const data = await apiRequest(`/admin/products?status=${status}`)
            setProducts(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (productId, status) => {
        try {
            await apiRequest(`/products/${productId}/approve`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            })
            toast.success(`Product ${status} successfully`)
            fetchProducts()
        } catch (err) {
            toast.error(err.message || 'Action failed')
        }
    }

    useEffect(() => {
        fetchProducts(filter)
    }, [filter])

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    }

    return (
        <div className="text-slate-700 mb-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl">Manage <span className="text-foreground font-medium">Products</span></h1>
                <div className="flex bg-slate-100 p-1 rounded-lg self-start">
                    {['pending', 'approved', 'rejected'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize ${filter === f ? 'bg-white text-foreground shadow-sm font-medium' : 'text-slate-700 hover:text-slate-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 mb-4">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {loading ? <Loading /> : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <CheckCircle size={40} className="text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">No {filter} products</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {products.map(product => {
                        const sc = statusConfig[product.status] || statusConfig.pending
                        const StatusIcon = sc.icon
                        return (
                            <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                    {product.image_url ? (
                                        <Image fill src={product.image_url.startsWith('http') ? product.image_url : `http://127.0.0.1:3001${product.image_url}`} alt={product.name} className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">No img</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${sc.color}`}>
                                            <StatusIcon size={11} /> {sc.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700">By <span className="font-medium text-slate-700">{product.seller_name}</span> · {product.category_name}</p>
                                    <p className="text-sm font-bold text-brand-orange mt-1">{Number(product.price).toLocaleString()} DA</p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {filter !== 'approved' && (
                                        <button onClick={() => handleApprove(product.id, 'approved')}
                                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                                            <CheckCircle size={15} /> Approve
                                        </button>
                                    )}
                                    {filter !== 'rejected' && (
                                        <button onClick={() => handleApprove(product.id, 'rejected')}
                                            className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                                            <XCircle size={15} /> Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
