'use client';

import React from 'react';
import { Sparkles, Heart, Globe, Users, Shield, Palette } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

const AboutPage = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-brand-blush/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 font-medium text-sm mb-4">
            <Sparkles size={16} />
            <span>{isAr ? 'قصتنا' : 'Our Story'}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-black tracking-tight max-w-4xl mx-auto leading-tight">
            {isAr ? 'تمكين الحرفيين، إحياء التراث' : 'Empowering Artisans, Reviving Heritage'}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'مانوفا هي وجهتك الأولى للمنتجات الحرفية الأصيلة. نحن نربط المبدعين الموهوبين بالعملاء الذين يقدرون الفن والجودة.'
              : 'Manuva is your premier destination for authentic handmade products. We connect talented creators with customers who appreciate art and quality.'}
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brand-black">
              {isAr ? 'رؤيتنا ومهمتنا' : 'Our Vision & Mission'}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {isAr
                ? 'نسعى في مانوفا إلى الحفاظ على المهارات الحرفية التقليدية من خلال إنشاء منصة حديثة تتيح للحرفيين عرض إبداعاتهم للعالم بأسره.'
                : 'At Manuva, we strive to preserve traditional crafting skills by creating a modern platform that allows artisans to showcase their creations to the world.'}
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              {isAr
                ? 'مهمتنا هي توفير مجتمع داعم حيث يزدهر الفن، ويجد كل منتج فريد صاحبه المناسب.'
                : 'Our mission is to provide a supportive community where art thrives, and every unique product finds its rightful owner.'}
            </p>
          </div>
          
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <Image 
              src="/images/artisan-working.jpg" 
              alt="Artisan working" 
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1000';
              }}
            />
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-black mb-4">
              {isAr ? 'قيمنا الأساسية' : 'Our Core Values'}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all translateY-hover">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">
                {isAr ? 'الشغف' : 'Passion'}
              </h3>
              <p className="text-slate-500">
                {isAr 
                  ? 'كل منتج في منصتنا مصنوع بشغف كامل واهتمام بأدق التفاصيل.' 
                  : 'Every product on our platform is made with complete passion and attention to the finest details.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all translateY-hover">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">
                {isAr ? 'الوصول العالمي' : 'Global Reach'}
              </h3>
              <p className="text-slate-500">
                {isAr 
                  ? 'نكسر الحدود الجغرافية لنوصل الأعمال اليدوية المحلية إلى الأسواق العالمية.' 
                  : 'We break geographical boundaries to deliver local handmade crafts to global markets.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all translateY-hover">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">
                {isAr ? 'الجودة والثقة' : 'Quality & Trust'}
              </h3>
              <p className="text-slate-500">
                {isAr 
                  ? 'نضمن لعملائنا أعلى مستويات الجودة في مجتمع مبني على الثقة المتبادلة.' 
                  : 'We guarantee our customers the highest levels of quality in a community built on mutual trust.'}
              </p>
            </div>
          </div>
        </section>


        {/* FAQ Teaser / Contact link */}
        <section className="text-center pb-12">
          <h2 className="text-2xl font-bold text-brand-black mb-6">
            {isAr ? 'هل تود الانضمام إلينا كحرفي؟' : 'Would you like to join us as an artisan?'}
          </h2>
          <a 
            href="/create-store" 
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Users size={20} />
            {isAr ? 'افتح متجرك الآن' : 'Open Your Store Now'}
          </a>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
