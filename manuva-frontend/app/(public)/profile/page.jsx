'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { User, Settings, Moon, Sun, Globe, LogOut, Save, Camera, MapPin, AlignLeft, ShoppingCart, Sparkles, Users, UserMinus } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'following'
  const [followingStores, setFollowingStores] = useState([]);

  const fetchFollowing = async () => {
    try {
      const data = await apiRequest('/user/following');
      setFollowingStores(data);
    } catch (err) {
      console.error('Fetch following error:', err);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'following') {
      fetchFollowing();
    }
  }, [user, activeTab]);

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

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleUnfollow = async (sellerId) => {
    try {
      await apiRequest(`/user/following/${sellerId}`, { method: 'DELETE' });
      setFollowingStores(prev => prev.filter(s => s.id !== sellerId));
      toast.success(language === 'ar' ? 'تم إلغاء المتابعة' : 'Unfollowed successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

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
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'profile' ? 'bg-brand-mauve text-white shadow-md' : 'text-foreground/70 hover:bg-muted'}`}
              >
                <User size={20} />
                {t('profile')}
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'following' ? 'bg-brand-mauve text-white shadow-md' : 'text-foreground/70 hover:bg-muted'}`}
              >
                <Users size={20} />
                {language === 'ar' ? 'المتاجر المتابعة' : 'Following'}
              </button>
              <button 
                onClick={() => router.push('/orders')}
                className="w-full flex items-center gap-4 px-6 py-4 text-foreground/70 hover:text-brand-mauve hover:bg-muted rounded-2xl font-medium transition-all"
              >
                <ShoppingCart size={20} />
                {language === 'ar' ? 'طلباتي' : 'My Orders'}
              </button>
              {user.role === 'customer' && (
                <button 
                  onClick={() => router.push('/create-store')}
                  className="w-full flex items-center gap-4 px-6 py-4 text-brand-mauve hover:bg-brand-mauve/5 rounded-2xl font-semibold transition-all border border-dashed border-brand-mauve/30 mt-2"
                >
                  <Sparkles size={20} className="text-brand-orange" />
                  {t('become_artisan')}
                </button>
              )}
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
          <div className="lg:col-span-8 space-y-8 transition-all duration-300">
            
            {activeTab === 'profile' ? (
              /* Edit Profile Form */
              <section className="bg-surface p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            ) : (
              /* Following Stores List */
              <section className="bg-surface p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-brand-pink/20 text-brand-mauve rounded-2xl">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight">{language === 'ar' ? 'المتاجر المتابعة' : 'Following Stores'}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'المتاجر التي تتابعها للحصول على تحديثات' : 'Stores you follow for updates'}</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-brand-mauve/10 text-brand-mauve rounded-xl text-sm font-bold">
                    {followingStores.length} {language === 'ar' ? 'متجر' : 'Stores'}
                  </div>
                </div>

                {followingStores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followingStores.map((store) => (
                      <div key={store.id} className="p-5 bg-background border border-border rounded-[2rem] flex items-center gap-4 group hover:border-brand-mauve/30 hover:shadow-md transition-all">
                        <div 
                          className="cursor-pointer overflow-hidden rounded-2xl w-16 h-16 flex-shrink-0"
                          onClick={() => router.push(`/shop/${store.id}`)}
                        >
                          <img 
                            src={store.profile_img || '/images/default-store.jpg'} 
                            alt={store.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-bold text-foreground hover:text-brand-mauve cursor-pointer truncate transition-colors"
                            onClick={() => router.push(`/shop/${store.id}`)}
                          >
                            {store.name}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {store.location || 'Unknown'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleUnfollow(store.id)}
                          className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                          title={language === 'ar' ? 'إلغاء المتابعة' : 'Unfollow'}
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 px-6">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                      <Users size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-foreground/70">{language === 'ar' ? 'لا تتابع أي متجر بعد' : 'No followed stores yet'}</h4>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                      {language === 'ar' ? 'ابدأ في اكتشاف الحرفيين المفضلين لديك ومتابعتهم' : 'Start discovering and following your favorite artisans'}
                    </p>
                    <button 
                      onClick={() => router.push('/shop')}
                      className="mt-8 px-8 py-3 bg-brand-mauve text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                      {language === 'ar' ? 'استكشف المتجر' : 'Explore Shop'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Application Settings Section */}
            <section className="bg-surface p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 flex items-center justify-center bg-brand-navy/10 text-brand-navy rounded-2xl">
                  <Settings size={24} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">{t('settings')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

