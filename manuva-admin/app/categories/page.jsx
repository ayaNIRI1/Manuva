'use client'
import React, { useEffect, useState } from 'react'
import { TagsIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Loading from '@/components/Loading'

const CategoriesAdmin = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Add Category Form
    const [showAddForm, setShowAddForm] = useState(false)
    const [newCategory, setNewCategory] = useState({ name: '', description: '', img: '' })
    const [submitting, setSubmitting] = useState(false)

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await apiRequest('/admin/categories').catch(() => [])
            setCategories(res || [])
        } catch (error) {
            console.error('Fetch categories error:', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? Products in this category will be affected.')) return;
        try {
            await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' })
            toast.success('Category deleted')
            setCategories(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            toast.error(error.message || 'Failed to delete category')
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('name', newCategory.name)
            if (newCategory.description) formData.append('description', newCategory.description)
            if (newCategory.img) formData.append('img', newCategory.img)

            await apiRequest('/admin/categories', { 
                method: 'POST',
                body: formData,
                isFormData: true
            })
            toast.success('Category added successfully')
            setNewCategory({ name: '', description: '', img: null })
            setShowAddForm(false)
            fetchData() // Refresh categories
        } catch (error) {
            toast.error(error.message || 'Failed to add category')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <TagsIcon className="text-brand-orange" size={32} />
                        Category Management
                    </h1>
                    <p className="text-slate-500 mt-2">Manage product categories and add new ones.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-brand-orange text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    {showAddForm ? <XIcon size={20} /> : <PlusIcon size={20} />}
                    {showAddForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Add Category Form */}
            {showAddForm && (
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-6 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Category Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Pottery"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-brand-orange"
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <input 
                                    type="text" 
                                    placeholder="Brief description"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-brand-orange"
                                    value={newCategory.description}
                                    onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                                />
                            </div>

                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : 'Save Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content list */}
            <div>
                {categories.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[30vh]">
                        <p className="text-slate-500">No categories found. Add some to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                                <div className="flex gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground truncate pr-8">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {category.description || 'No description provided'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                    <span>Added {new Date(category.created_at).toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Delete Category"
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoriesAdmin
