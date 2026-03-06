'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext({
  language: 'ar',
  setLanguage: () => {},
  t: (key) => key,
});

const translations = {
  ar: {
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    theme: 'المظهر',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    edit: 'تعديل',
    name: 'الاسم',
    bio: 'نبذة شخصية',
    location: 'الموقع',
    save: 'حفظ التغييرات',
    dark: 'ليلي',
    light: 'نهاري',
    arabic: 'العربية',
    english: 'English',
    my_account: 'حسابي',
    home: 'الرئيسية',
    shop: 'المتجر',
    about: 'من نحن',
    contact: 'تواصل معنا',
    become_artisan: 'كن حرفياً',
    store_setup: 'إعداد المتجر',
    store_name: 'اسم المتجر',
    store_description: 'وصف المتجر',
    submit: 'إرسال',
  },
  en: {
    profile: 'Profile',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    logout: 'Logout',
    edit: 'Edit',
    name: 'Name',
    bio: 'Bio',
    location: 'Location',
    save: 'Save Changes',
    dark: 'Dark',
    light: 'Light',
    arabic: 'Arabic',
    english: 'English',
    my_account: 'My Account',
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    become_artisan: 'Become an Artisan',
    store_setup: 'Store Setup',
    store_name: 'Store Name',
    store_description: 'Store Description',
    submit: 'Submit',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
