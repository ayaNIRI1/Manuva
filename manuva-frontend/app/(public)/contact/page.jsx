'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { apiRequest } from '@/lib/api';

const ContactPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setStatus({ 
        type: 'error', 
        message: isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.' 
      });
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setStatus({ type: 'success', message: response.message });
      setFormData({ email: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-brand-blush/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-brand-navy sm:text-5xl mb-4">
            {t('contact')}
          </h1>
          <p className="text-lg text-brand-prune max-w-2xl mx-auto">
            {isAr 
              ? 'نحن هنا لمساعدتكم. إذا كان لديكم أي استفسار أو تودون معرفة المزيد عن خدماتنا، لا تترددوا في التواصل معنا.' 
              : 'We are here to help. If you have any questions or want to learn more about our services, feel free to contact us.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-surface border border-border rounded-3xl p-8 lg:p-12 text-black shadow-xl transition-colors">
            <h2 className="text-2xl font-bold mb-8 text-black">
              {isAr ? 'معلومات التواصل' : 'Contact Information'}
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-primary font-semibold">{isAr ? 'البريد الإلكتروني' : 'Email'}</h3>
                  <p className="text-muted-foreground">support@manuva.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-primary font-semibold">{isAr ? 'الهاتف' : 'Phone'}</h3>
                  <p className="text-muted-foreground">+21666378037</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-primary font-semibold">{isAr ? 'الموقع' : 'Location'}</h3>
                  <p className="text-muted-foreground">
                    {isAr ? 'الجزائر، سوق أهراس' : 'Algeria, Souk Ahras'}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="mt-12 pt-12 border-t border-border">
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            {status.type && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-brand-blush/20 border border-brand-mauve/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-mauve focus:border-transparent transition-all text-black"
                  placeholder="john@example.com"
                />

              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-black mb-2">
                  {isAr ? 'المشكلة أو الرسالة' : 'Problem or Message'}
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="7"
                  className="w-full px-4 py-3 bg-brand-blush/20 border border-brand-mauve/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-mauve focus:border-transparent transition-all resize-none text-black"
                  placeholder={isAr ? 'اكتب رسالتك أو مشكلتك هنا...' : 'Write your problem or message here...'}
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-brand-navy text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isAr ? 'إرسال' : 'Send'}</span>
                    <Send className={`w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
