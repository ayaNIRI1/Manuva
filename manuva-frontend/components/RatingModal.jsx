'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '@/lib/api';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            return toast.error('Please select a rating');
        }
        if (review.length > 0 && review.length < 5) {
            return toast.error('Review must be at least 5 characters');
        }

        try {
            const response = await apiRequest('/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: ratingModal.productId,
                    rating: rating,
                    comment: review
                })
            });

            dispatch(addRating({
                orderId: ratingModal.orderId,
                productId: ratingModal.productId,
                rating: rating,
                comment: review
            }));

            toast.success('Thank you for your review!');
            setRatingModal(null);
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error(error.message || 'Failed to submit review');
        }
    }

    return (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
            <div className='bg-white p-8 rounded-3xl shadow-2xl w-96 relative border border-slate-100'>
                <button onClick={() => setRatingModal(null)} className='absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-2xl font-black text-foreground mb-6 flex items-center gap-2'>
                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                    Rate Product
                </h2>
                <div className='flex items-center justify-center mb-6 gap-2'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer transition-all ${rating > i ? "text-yellow-400 fill-yellow-400 scale-110" : "text-slate-200"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-green-400/20 focus:bg-white transition-all text-sm h-32'
                    placeholder='How was the product? Write your review...'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button 
                    onClick={() => toast.promise(handleSubmit(), { loading: 'Submitting...' })} 
                    className='w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200'
                >
                    Submit Review
                </button>
            </div>
        </div>
    )
}

export default RatingModal