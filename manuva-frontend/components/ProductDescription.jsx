'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { assets } from "@/assets/assets"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

    const getFullImageUrl = (img) => {
        if (!img) return assets.artisan_placeholder;
        if (typeof img === 'string') {
            return img.startsWith('http') ? img : `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        }
        return img;
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {product.rating?.length > 0 ? product.rating.map((item,index) => (
                        <div key={index} className="flex gap-5 mb-10">
                            <Image src={getFullImageUrl(item.user.image)} alt="" className="size-10 rounded-full object-cover" width={100} height={100} />
                            <div>
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, index) => (
                                        <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="font-medium text-foreground">{item.user.name}</p>
                                <p className="mt-3 font-light text-xs text-slate-400">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed max-w-2xl">
                            <p className="text-slate-400 italic">
                                {product.review_count > 0 ? 'Loading reviews...' : 'No reviews yet for this product.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Store Page */}
            {product.store ? (
                <div className="flex gap-3 mt-14">
                    <Image src={product.store?.logo || assets.artisan_placeholder} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.store?.name}</p>
                        <Link href={`/shop/${product.store?.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 mt-14">
                    <Image width={44} height={44} src={assets.artisan_placeholder} alt="" className="size-11 rounded-full ring ring-slate-400" />
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.seller_name}</p>
                        <p className="text-xs text-slate-400">{product.seller_location}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription