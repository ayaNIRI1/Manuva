# دليل ربط وتشغيل مشروع Manuva 🚀

## نظرة عامة

تم ربط الـ Frontend (Next.js) بالـ Backend (Express.js) بنجاح! هذا الدليل يشرح كيفية تشغيل المشروع.

---

## 📁 هيكل المشروع

```
manuvaProject/
├── manuva-frontend/          # تطبيق Next.js
│   ├── .env.local            # ✅ تم إنشاؤه - إعدادات الاتصال بالـ Backend
│   ├── app/                  # صفحات التطبيق
│   ├── components/           # المكونات
│   └── package.json
│
└── manuva-backend/           # خادم Express.js
    ├── .env                  # إعدادات قاعدة البيانات والخادم
    ├── src/
    │   ├── server.js        # نقطة البداية
    │   ├── routes/          # مسارات API
    │   └── config/          # إعدادات قاعدة البيانات
    └── package.json
```

---

## ⚙️ الإعدادات المطلوبة

### 1. إعدادات الـ Backend (مانوفا-backend/.env)

```env
# إعدادات الخادم
PORT=3000                                        # المنفذ الذي يعمل عليه الـ Backend
NODE_ENV=development

# إعدادات قاعدة البيانات PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manuva_v
DB_USER=postgres
DB_PASSWORD=aya                                  # ⚠️ غير كلمة المرور الخاصة بك

# إعدادات JWT للمصادقة
JWT_SECRET=manuva_super_secret_key_change_in_production
JWT_EXPIRE=7d

# إعدادات رفع الملفات
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 2. إعدادات الـ Frontend (مانوفا-frontend/.env.local) ✅

```env
# عملة التطبيق
NEXT_PUBLIC_CURRENCY_SYMBOL='دج'

# عنوان API الخاص بالـ Backend
NEXT_PUBLIC_API_URL='http://localhost:3000/api'  # ✅ تم ربطه بالـ Backend

# إعدادات التطبيق
NEXT_PUBLIC_APP_NAME='Manuva'
NEXT_PUBLIC_APP_DESCRIPTION='منصة المنتجات الحرفية الجزائرية'
```

---

## 🗄️ إعداد قاعدة البيانات

### 1. تثبيت PostgreSQL

تأكد من تثبيت PostgreSQL على جهازك:

**Windows:**

- حمل من: https://www.postgresql.org/download/windows/

**Mac:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. إنشاء قاعدة البيانات

```bash
# فتح PostgreSQL
psql -U postgres

# إنشاء قاعدة بيانات جديدة
CREATE DATABASE "manuva_v";

# التحقق من إنشاء القاعدة
\l

# الخروج
\q
```

### 3. تهيئة جداول قاعدة البيانات

```bash
cd manuva-backend
npm run init-db
```

هذا سينشئ الجداول التالية:

- users (المستخدمين)
- categories (الفئات)
- products (المنتجات)
- orders (الطلبات)
- order_items (تفاصيل الطلبات)
- reviews (التقييمات)
- artisans (الحرفيين)

---

## 📦 تثبيت المكتبات

### Backend

```bash
cd manuva-backend
npm install
```

المكتبات المطلوبة:

- express: خادم الويب
- pg: للاتصال بـ PostgreSQL
- bcryptjs: لتشفير كلمات المرور
- jsonwebtoken: للمصادقة
- cors: للسماح بطلبات من الـ Frontend
- multer: لرفع الملفات
- dotenv: لقراءة ملف .env

### Frontend

```bash
cd manuva-frontend
npm install
```

المكتبات المطلوبة:

- next: إطار عمل React
- react & react-dom: مكتبة React
- @reduxjs/toolkit: إدارة الحالة
- react-redux: ربط Redux بـ React
- tailwindcss: للتصميم
- react-hot-toast: للإشعارات

---

## 🚀 تشغيل المشروع

### الطريقة الأولى: تشغيل كل واحد في نافذة منفصلة

**نافذة Terminal الأولى - Backend:**

```bash
cd manuva-backend
npm run dev
```

سترى:

```
=================================
🚀 Manuva Backend Server
=================================
📡 Server running on port 3000
🌍 Environment: development
🔗 Health check: http://localhost:3000/health
=================================
```

**نافذة Terminal الثانية - Frontend:**

```bash
cd manuva-frontend
npm run dev
```

سترى:

```
▲ Next.js 15.3.5
- Local:        http://localhost:3001
- ready in 2.3s
```

### الطريقة الثانية: باستخدام سكريبت واحد (اختياري)

يمكنك إنشاء سكريبت لتشغيل الاثنين معاً:

**Windows (start-all.bat):**

```batch
@echo off
start cmd /k "cd manuva-backend && npm run dev"
start cmd /k "cd manuva-frontend && npm run dev"
```

**Mac/Linux (start-all.sh):**

```bash
#!/bin/bash
cd manuva-backend && npm run dev &
cd manuva-frontend && npm run dev &
wait
```

---

## 🔍 التحقق من الاتصال

### 1. اختبار الـ Backend

افتح المتصفح وانتقل إلى:

```
http://localhost:3000/health
```

يجب أن ترى:

```json
{
  "status": "ok",
  "message": "Manuva API is running",
  "timestamp": "2026-02-07T17:00:00.000Z"
}
```

### 2. اختبار API Routes

جرب هذه المسارات:

- `http://localhost:3000/api/products` - قائمة المنتجات
- `http://localhost:3000/api/categories` - الفئات
- `http://localhost:3000/api/artisans` - الحرفيين

### 3. اختبار الـ Frontend

افتح:

```
http://localhost:3001
```

يجب أن يظهر موقع Manuva بشكل كامل.

---

## 🔗 مسارات API المتاحة

### المصادقة (Authentication)

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي

### المنتجات (Products)

- `GET /api/products` - قائمة جميع المنتجات
- `GET /api/products/:id` - منتج محدد
- `POST /api/products` - إضافة منتج (يتطلب تسجيل دخول)
- `PUT /api/products/:id` - تحديث منتج
- `DELETE /api/products/:id` - حذف منتج

### الفئات (Categories)

- `GET /api/categories` - قائمة الفئات
- `POST /api/categories` - إضافة فئة جديدة

### الطلبات (Orders)

- `GET /api/orders` - قائمة الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `GET /api/orders/:id` - تفاصيل طلب محدد

### التقييمات (Reviews)

- `GET /api/reviews/product/:productId` - تقييمات منتج محدد
- `POST /api/reviews` - إضافة تقييم

### المستخدم (User)

- `GET /api/user/profile` - معلومات الملف الشخصي
- `PUT /api/user/profile` - تحديث الملف الشخصي

### الحرفيين (Artisans)

- `GET /api/artisans` - قائمة الحرفيين
- `GET /api/artisans/:id` - معلومات حرفي محدد

---

## 🛠️ حل المشاكل الشائعة

### 1. Backend لا يعمل

**المشكلة:** `Error: connect ECONNREFUSED`

**الحل:**

- تأكد من تشغيل PostgreSQL
- تحقق من بيانات الاتصال في `.env`
- جرب إعادة إنشاء قاعدة البيانات

```bash
psql -U postgres
DROP DATABASE "manuva_v";
CREATE DATABASE "manuva_v";
\q

cd manuva-backend
npm run init-db
```

### 2. Frontend لا يتصل بالـ Backend

**المشكلة:** CORS errors أو API calls fail

**الحل:**

- تأكد من وجود ملف `.env.local` في manuva-frontend
- تأكد من أن URL صحيح: `http://localhost:3000/api`
- أعد تشغيل الـ Frontend بعد تغيير `.env.local`

```bash
cd manuva-frontend
rm -rf .next
npm run dev
```

### 3. Port مشغول

**المشكلة:** `Port 3000 is already in use`

**الحل:**

**Windows:**

```bash
netstat -ano | findstr :3000
taskkill /PID <رقم_العملية> /F
```

**Mac/Linux:**

```bash
lsof -ti:3000 | xargs kill -9
```

أو غير المنفذ في `.env`:

```env
PORT=3001
```

واضبط `.env.local`:

```env
NEXT_PUBLIC_API_URL='http://localhost:3001/api'
```

### 4. مكتبات ناقصة

**المشكلة:** `Module not found`

**الحل:**

```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 بيانات تجريبية (Optional)

لإضافة بيانات تجريبية للاختبار:

```sql
-- افتح PostgreSQL
psql -U postgres -d manuva_v

-- إضافة فئات
INSERT INTO categories (name, description, img) VALUES
('الفخار', 'منتجات فخارية يدوية تقليدية', '/images/pottery.jpg'),
('المجوهرات', 'حلي وإكسسوارات حرفية', '/images/jewelry.jpg'),
('المنسوجات', 'أقمشة ومنسوجات تقليدية', '/images/textiles.jpg');

-- إضافة مستخدم تجريبي (كلمة المرور: password123)
INSERT INTO users (email, password, name, role) VALUES
('test@manuva.com', '$2a$10$YourHashedPasswordHere', 'اسم تجريبي', 'customer');
```

---

## 🔐 أمان الإنتاج

عند نشر المشروع للإنتاج:

### 1. Backend `.env`

```env
NODE_ENV=production
JWT_SECRET=<مفتاح-قوي-جدا-وعشوائي>
DB_PASSWORD=<كلمة-مرور-قوية>
```

### 2. Frontend `.env.production`

```env
NEXT_PUBLIC_API_URL='https://api.yourdomain.com/api'
```

### 3. تفعيل HTTPS

### 4. تقييد CORS في الـ Backend للسماح فقط للدومين الخاص بك

---

## 📚 موارد إضافية

- **Next.js Documentation:** https://nextjs.org/docs
- **Express.js Guide:** https://expressjs.com/
- **PostgreSQL Tutorial:** https://www.postgresql.org/docs/
- **Redux Toolkit:** https://redux-toolkit.js.org/

---

## ✅ خطوات سريعة للبدء

```bash
# 1. تأكد من تشغيل PostgreSQL
sudo systemctl start postgresql  # Linux
# أو ابدأ PostgreSQL من تطبيق pgAdmin

# 2. أنشئ قاعدة البيانات
psql -U postgres -c 'CREATE DATABASE "manuva_v";'

# 3. شغل الـ Backend
cd manuva-backend
npm install
npm run init-db
npm run dev

# 4. في نافذة جديدة، شغل الـ Frontend
cd manuva-frontend
npm install
npm run dev

# 5. افتح المتصفح
# Frontend: http://localhost:3001
# Backend: http://localhost:3000/health
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من سجلات الأخطاء في Terminal
2. تأكد من تشغيل PostgreSQL
3. تحقق من ملفات `.env`
4. راجع قسم "حل المشاكل الشائعة" أعلاه

---

**تم إنشاء هذا الدليل بواسطة Claude AI** 🤖
**تاريخ:** 7 فبراير 2026

بالتوفيق في مشروعك! 🎉
