'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'دج'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-gradient-to-br from-brand-white via-brand-light to-brand-white rounded-3xl xl:min-h-100 group shadow-lg'>
                    <div className='p-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-brand-light/30 text-brand-dark pr-4 p-1 rounded-full text-xs sm:text-sm border border-brand-light'>
                            <span className='bg-gradient-to-r from-brand-orange to-brand-dark px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs font-medium'>جديد</span> 
                            دعم الحرفيين المحليين - كل قطعة فريدة 
                            <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-bold bg-gradient-to-r from-brand-black via-brand-dark to-brand-orange bg-clip-text text-transparent max-w-xs sm:max-w-md'>
                            منتجات حرفية أصيلة. بلمسة جزائرية.
                        </h2>
                        <p className='text-slate-700 text-sm sm:text-base mt-4 max-w-md leading-relaxed'>
                            اكتشف روائع الحرف اليدوية الجزائرية - من الفخار إلى المنسوجات، كل منتج يحكي قصة تراثنا العريق
                        </p>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                            <p className='text-brand-dark'>تبدأ الأسعار من</p>
                            <p className='text-3xl font-bold text-brand-black'>{currency} 500</p>
                        </div>
                        <button className='bg-gradient-to-r from-brand-orange to-brand-dark text-white text-sm font-medium py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300'>
                            استكشف المنتجات
                        </button>
                    </div>
                    {assets.hero_model_img && (
                        <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm opacity-90' src={assets.hero_model_img} alt="Handmade crafts" />
                    )}
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-brand-light to-brand-white rounded-3xl p-6 px-8 group shadow-md hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-brand-black to-brand-dark bg-clip-text text-transparent max-w-40'>
                                حرف تقليدية
                            </p>
                            <p className='flex items-center gap-1 mt-4 text-brand-orange font-medium'>
                                اكتشف المزيد <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> 
                            </p>
                        </div>
                        {assets.hero_product_img1 && (
                            <Image className='w-35 drop-shadow-lg' src={assets.hero_product_img1} alt="" />
                        )}
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-brand-white to-brand-light rounded-3xl p-6 px-8 group shadow-md hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-brand-dark to-brand-orange bg-clip-text text-transparent max-w-40'>
                                منتجات طبيعية
                            </p>
                            <p className='flex items-center gap-1 mt-4 text-brand-dark font-medium'>
                                تصفح الآن <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> 
                            </p>
                        </div>
                        {assets.hero_product_img2 && (
                            <Image className='w-35 drop-shadow-lg' src={assets.hero_product_img2} alt="" />
                        )}
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
