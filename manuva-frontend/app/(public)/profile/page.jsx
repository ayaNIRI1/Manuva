'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { User, Settings, Moon, Sun, Globe, LogOut, Save, Camera, MapPin, AlignLeft, ShoppingCart } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      updateUser(updatedUser);
      toast.success(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary">
      
      <main className="max-w-6xl mx-auto py-12 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar - Profile Card */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-8 bg-surface rounded-[2rem] border border-border shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center text-primary overflow-hidden border-4 border-surface shadow-md">
                  {user.profile_img ? (
                    <img src={user.profile_img} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush to-brand-pink dark:from-brand-navy/50 dark:to-brand-prune/30">
                      <User size={56} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-brand-mauve text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-surface">
                  <Camera size={16} />
                </button>
              </div>

              <div className="mt-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h2>
                <p className="text-sm font-medium text-muted-foreground/80">{user.email}</p>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="px-4 py-1.5 bg-brand-mauve/10 text-brand-mauve rounded-full text-xs font-bold uppercase tracking-widest border border-brand-mauve/20">
                  {user.role}
                </span>
                {user.is_verified && (
                  <span className="px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-widest border border-green-500/20">
                    {language === 'ar' ? 'موثق' : 'Verified'}
                  </span>
                )}
              </div>
            </div>

            <nav className="bg-surface p-2 rounded-[2rem] border border-border shadow-sm space-y-1">
              <button className="w-full flex items-center gap-4 px-6 py-4 bg-brand-mauve text-white rounded-2xl font-semibold shadow-md shadow-brand-mauve/20">
                <User size={20} />
                {t('profile')}
              </button>
              <button 
                onClick={() => router.push('/orders')}
                className="w-full flex items-center gap-4 px-6 py-4 text-foreground/70 hover:text-brand-mauve hover:bg-muted rounded-2xl font-medium transition-all"
              >
                <ShoppingCart size={20} />
                {language === 'ar' ? 'طلباتي' : 'My Orders'}
              </button>
              <div className="h-px bg-border/50 my-2 mx-4"></div>
              <button 
                onClick={logout} 
                className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl font-semibold transition-all"
              >
                <LogOut size={20} />
                {t('logout')}
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Edit Profile Form */}
            <section className="bg-surface p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 flex items-center justify-center bg-brand-blush/50 dark:bg-brand-navy/30 text-brand-mauve rounded-2xl">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">{t('profile')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'أكمل بياناتك الشخصية لتحسين تجربتك' : 'Complete your personal data to improve your experience'}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name field */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold ml-1 text-foreground/80">{t('name')}</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-mauve transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                        placeholder={t('name')}
                      />
                    </div>
                  </div>

                  {/* Location field */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold ml-1 text-foreground/80">{t('location')}</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-mauve transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full pl-12 pr-5 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                        placeholder={t('location')}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio field */}
                <div className="space-y-2.5">
                  <label className="text-sm font-bold ml-1 text-foreground/80">{t('bio')}</label>
                  <div className="relative group">
                    <AlignLeft className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-brand-mauve transition-colors" size={18} />
                    <textarea 
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-brand-mauve/20 focus:border-brand-mauve outline-none transition-all resize-none placeholder:text-muted-foreground/50 font-medium"
                      placeholder={t('bio')}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    disabled={isSaving}
                    className="w-full sm:w-auto px-10 py-4 bg-brand-mauve text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-brand-mauve/20 active:scale-95 disabled:opacity-50 transition-all border border-brand-mauve/20"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Save size={18} />
                    )}
                    {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('save')}
                  </button>
                </div>
              </form>
            </section>

            {/* Application Settings Section */}
            <section className="bg-surface p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 flex items-center justify-center bg-brand-navy/10 text-brand-navy rounded-2xl">
                  <Settings size={24} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">{t('settings')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Toggle Card */}
                <div className="flex items-center justify-between p-6 bg-background border border-border rounded-3xl hover:border-brand-mauve/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-brand-mauve/10 text-brand-mauve' : 'bg-brand-mauve/10 text-brand-mauve'}`}>
                      {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
                    </div>
                    <div>
                      <p className="font-bold text-base">{t('theme')}</p>
                      <p className="text-xs font-medium text-muted-foreground/80 mt-0.5">{theme === 'dark' ? t('dark') : t('light')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-14 h-7 rounded-full transition-all relative outline-none focus:ring-4 focus:ring-brand-mauve/10 ${theme === 'dark' ? 'bg-brand-mauve' : 'bg-brand-pink'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform ${theme === 'dark' ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Language Switch Card */}
                <div className="flex items-center justify-between p-6 bg-background border border-border rounded-3xl hover:border-primary/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl">
                      <Globe size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-base">{t('language')}</p>
                      <p className="text-xs font-medium text-muted-foreground/80 mt-0.5">{language === 'ar' ? t('arabic') : t('english')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 bg-muted p-1.5 rounded-2xl">
                    <button 
                      onClick={() => setLanguage('ar')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${language === 'ar' ? 'bg-primary text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
                    >
                      عربي
                    </button>
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${language === 'en' ? 'bg-primary text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

    </div>
  );
}

