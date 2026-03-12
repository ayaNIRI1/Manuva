# Manuva - Handmade Products Marketplace

Manuva is a comprehensive platform for buying and selling handmade products. It consists of three main components: a frontend application for customers, an administrative dashboard for managing the marketplace, and a robust backend API.

## Project Architecture

The project is structured as a monorepo-style repository with three primary directories:

- **`manuva-frontend`**: The customer-facing web application.
- **`manuva-admin`**: The administrative interface for marketplace management.
- **`manuva-backend`**: The API server and database management layer.

---

## Technology Stack

### Frontend & Admin
Both the customer frontend and the admin dashboard are built with modern web technologies:

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/) (mainly in Admin)
- **Real-time**: [Socket.io-client](https://socket.io/)

### Backend
The backend provides a secure and scalable API:

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg` driver)
- **Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin) & JWT
- **Payments**: [Chargily Pay](https://chargily.com/pay)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Validation**: [Express Validator](https://express-validator.github.io/docs/)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd manuva-project-connected
   ```

2. **Setup Backend:**
   ```bash
   cd manuva-backend
   npm install
   # Configure your .env file (copy from .env.example if available)
   npm run init-db # Initialize the database
   npm run dev     # Start backend in development mode
   ```

3. **Setup Frontend:**
   ```bash
   cd ../manuva-frontend
   npm install
   npm run dev
   ```

4. **Setup Admin:**
   ```bash
   cd ../manuva-admin
   npm install
   npm run dev
   ```

---

## Available Scripts

### Backend (`manuva-backend`)
- `npm run dev`: Starts the server using `nodemon`.
- `npm start`: Starts the server using `node`.
- `npm run init-db`: Initializes the PostgreSQL database.
- `npm run clear-db`: Clears the database (use with caution).

### Frontend & Admin (`manuva-frontend` & `manuva-admin`)
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

---

## License
MIT
