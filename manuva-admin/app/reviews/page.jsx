'use client'
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import Loading from "@/components/Loading"
import Image from "next/image"
import { Trash2, StarIcon, AlertCircle, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending') // 'pending' or 'approved'
    const [error, setError] = useState(null)

    const fetchReviews = async (status = filter) => {
        setLoading(true)
        try {
            const data = await apiRequest(`/admin/reviews?status=${status}`)
            setReviews(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (reviewId, action) => {
        try {
            await apiRequest(`/admin/reviews/${reviewId}/approve`, {
                method: 'PATCH',
                body: JSON.stringify({ action })
            })
            toast.success(action === 'approve' ? 'Comment approved ✓' : 'Comment rejected')
            fetchReviews(filter)
        } catch (err) {
            toast.error(err.message || 'Action failed')
        }
    }

    const handleDelete = async (reviewId) => {
        if (!confirm('Delete this review entirely?')) return
        try {
            await apiRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE' })
            toast.success('Review deleted')
            setReviews(prev => prev.filter(r => r.id !== reviewId))
        } catch (err) {
            toast.error(err.message || 'Failed to delete')
        }
    }

    useEffect(() => {
        fetchReviews(filter)
    }, [filter])

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Comments</span></h1>
                <div className="flex bg-slate-100 p-1 rounded-lg self-start">
                    {['pending', 'approved'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize flex items-center gap-1.5 ${filter === f ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                            {f === 'pending' ? <Clock size={13} /> : <CheckCircle size={13} />}
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

            {loading ? <Loading /> : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <MessageSquare size={40} className="text-slate-300 mb-3" />
                    <p className="text-slate-400 font-medium">No {filter} comments</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map(review => (
                        <div key={review.id} className={`bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-start gap-4 shadow-sm ${!review.is_approved ? 'border-amber-200' : 'border-slate-200'}`}>
                            {/* Buyer */}
                            <div className="flex items-center gap-3 md:w-44 flex-shrink-0">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                                    {review.buyer_image ? (
                                        <Image fill src={review.buyer_image.startsWith('http') ? review.buyer_image : `http://127.0.0.1:3001${review.buyer_image}`} alt={review.buyer_name} className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold">{review.buyer_name?.[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{review.buyer_name}</p>
                                    <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Review content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <div className="flex items-center gap-0.5">
                                        {Array(5).fill('').map((_, i) => (
                                            <StarIcon key={i} size={14} fill={review.rating > i ? "#F59E0B" : "#E5E7EB"} stroke="none" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {review.product_name}
                                    </span>
                                    {!review.is_approved && (
                                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Clock size={11} /> Pending
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {review.comment || <span className="italic text-slate-400">No comment text</span>}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {!review.is_approved && (
                                    <>
                                        <button onClick={() => handleApprove(review.id, 'approve')}
                                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all">
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleApprove(review.id, 'reject')}
                                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold transition-all">
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(review.id)}
                                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-bold transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
