'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

import { useLanguage } from '@/lib/language-context'

const Hero = () => {

    const { t, language } = useLanguage()
    const isAr = language === 'ar'
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || (isAr ? 'دج' : 'DZD')

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-gradient-to-br from-brand-white via-brand-light to-brand-white rounded-3xl xl:min-h-110 group shadow-lg'>
                    <div className='p-5 sm:p-16'>
                        <div className={`inline-flex items-center gap-3 bg-brand-light/30 text-brand-dark ${isAr ? 'pl-4' : 'pr-4'} p-1 rounded-full text-xs sm:text-sm border border-brand-light`}>
                            <span className='bg-brand-orange px-3 py-1 rounded-full text-white text-xs font-medium'>{t('hero_badge')}</span> 
                            {t('hero_badge_text')}
                            {isAr ? <ChevronRightIcon className='group-hover:mr-2 rotate-180 transition-all' size={16} /> : <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />}
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-extrabold bg-gradient-to-r from-brand-black via-brand-orange to-brand-dark bg-clip-text text-transparent max-w-xs sm:max-w-md'>
                            {t('hero_title')}
                        </h2>
                        <p className='text-slate-900 font-bold text-sm sm:text-base mt-4 max-w-md leading-relaxed'>
                            {t('hero_desc')}
                        </p>
                        <div className='text-foreground text-sm font-medium mt-4 sm:mt-8'>
                            <p className='text-brand-dark'>{t('price_starts')}</p>
                            <p className='text-3xl font-bold text-brand-black'>{isAr ? `${currency} 500` : `500 ${currency}`}</p>
                        </div>
                        <button className='bg-brand-orange text-white text-sm font-medium py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300'>
                            {t('explore_products')}
                        </button>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-brand-light to-brand-white rounded-3xl p-6 px-8 group shadow-md hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-brand-black to-brand-dark bg-clip-text text-transparent max-w-40'>
                                {t('traditional_crafts')}
                            </p>
                            <p className={`flex items-center gap-1 mt-4 text-brand-orange font-medium select-none`}>
                                {t('discover_more')} {isAr ? <ArrowRightIcon className='group-hover:mr-2 rotate-180 transition-all' size={18} /> : <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />}
                            </p>
                        </div>
                        {assets.hero_product_img1 && (
                            <Image className='w-35 drop-shadow-lg' src={assets.hero_product_img1} alt="" />
                        )}
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-brand-white to-brand-light rounded-3xl p-6 px-8 group shadow-md hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-3xl font-bold bg-gradient-to-r from-brand-dark to-brand-orange bg-clip-text text-transparent max-w-40'>
                                {t('natural_products')}
                            </p>
                            <p className={`flex items-center gap-1 mt-4 text-brand-dark font-medium select-none`}>
                                {t('browse_now')} {isAr ? <ArrowRightIcon className='group-hover:mr-2 rotate-180 transition-all' size={18} /> : <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />}
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
