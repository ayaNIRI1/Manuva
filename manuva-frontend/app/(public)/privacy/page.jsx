'use client';

import React from 'react';
import { Shield, Lock, Eye, FileText, Bell, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const PrivacyPage = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: isAr ? 'المعلومات التي نجمعها' : 'Information We Collect',
      content: isAr 
        ? 'نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، مثل الاسم، البريد الإلكتروني، ورقم الهاتف.'
        : 'We collect information you provide directly to us when you create an account, such as your name, email address, and phone number.'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: isAr ? 'كيف نستخدم معلوماتك' : 'How We Use Your Information',
      content: isAr
        ? 'نستخدم معلوماتك لتشغيل وصيانة وتحسين خدماتنا، ومعالجة المعاملات، والتواصل معك.'
        : 'We use your information to operate, maintain, and improve our services, process transactions, and communicate with you.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: isAr ? 'حماية البيانات' : 'Data Protection',
      content: isAr
        ? 'نحن نتخذ تدابير أمنية تقنية وتنظيمية لحماية بياناتك الشخصية من الوصول غير المصرح به.'
        : 'We take technical and organizational security measures to protect your personal data from unauthorized access.'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: isAr ? 'التغييرات في السياسة' : 'Policy Changes',
      content: isAr
        ? 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة.'
        : 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-blush/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-mauve/10 text-brand-mauve font-bold text-xs uppercase tracking-widest border border-brand-mauve/20">
            <Lock size={14} />
            <span>{isAr ? 'الخصوصية والأمان' : 'Privacy & Security'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black tracking-tight">
            {t('privacy_policy')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {isAr 
              ? 'نحن نهتم بخصوصيتك ونلتزم بحماية بياناتك الشخصية.' 
              : 'We care about your privacy and are committed to protecting your personal data.'}
          </p>
        </div>

        <div className="grid gap-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-light/30 text-brand-orange rounded-2xl flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                  {section.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-brand-black">{section.title}</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-brand-mauve/20 pl-4 py-1">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-10 bg-white text-black rounded-[2.5rem] text-center shadow-2xl border border-slate-100">
          <Globe className="w-10 h-10 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">
            {isAr ? 'هل لديك أي استفسار؟' : 'Have any questions?'}
          </h2>
          <p className="text-brand-light mb-8 max-w-lg mx-auto">
            {isAr 
              ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية الخاصة بنا، لا تتردد في الاتصال بنا.' 
              : 'If you have any questions about our Privacy Policy, feel free to contact us.'}
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {t('contact')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
