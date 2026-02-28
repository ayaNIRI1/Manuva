# مشروع Manuva - دليل البدء السريع ⚡

## 🎯 الخطوات السريعة

### 1️⃣ تثبيت المكتبات

```bash
# Backend
cd manuva-backend
npm install

# Frontend
cd ../manuva-frontend
npm install
```

### 2️⃣ إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
psql -U postgres -c 'CREATE DATABASE "manuva_v";'

# تهيئة الجداول
cd manuva-backend
npm run init-db
```

### 3️⃣ التشغيل

**باستخدام السكريبت:**

- Windows: انقر مرتين على `start-manuva.bat`
- Mac/Linux: `./start-manuva.sh`

**يدوياً:**

نافذة Terminal 1:

```bash
cd manuva-backend
npm run dev
```

نافذة Terminal 2:

```bash
cd manuva-frontend
npm run dev
```

### 4️⃣ افتح المتصفح

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/health

---

## 📋 المتطلبات

- ✅ Node.js (v16 أو أحدث)
- ✅ PostgreSQL (v12 أو أحدث)
- ✅ npm أو yarn

---

## 🔧 الإعدادات المهمة

### Backend `.env`

```env
PORT=3000
DB_NAME=manuva_v
DB_USER=postgres
DB_PASSWORD=aya  # غير هذا لكلمة المرور الخاصة بك
```

### Frontend `.env.local` (تم إنشاؤه تلقائياً ✅)

```env
NEXT_PUBLIC_API_URL='http://localhost:3000/api'
```

---

## 🆘 مشاكل شائعة؟

راجع الدليل الشامل في: **MANUVA_CONNECTION_GUIDE.md**

---

## 📱 اتصل بنا

إذا واجهت مشاكل، راجع سجلات الأخطاء في Terminal

**تم الربط بنجاح! ✅**
