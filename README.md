# CampusBite - Bennett University Food Pre-Order Platform

CampusBite is a comprehensive food pre-ordering solution designed specifically for Bennett University. It allows students to skip long queues by ordering food from campus outlets (like Hotspot, Southern Stories, etc.) either for immediate pickup or scheduled for a later time.

## 🚀 Features

### For Students
- **Instant & Scheduled Orders**: Order food to be ready ASAP or pick a specific time later in the day.
- **Real-time Tracking**: Monitor your order status from 'Placed' to 'Ready for Pickup'.
- **Seamless Cart Experience**: Add items from multiple categories with ease.
- **Responsive Design**: Polished, mobile-first UI with smooth animations (Framer Motion).
- **University Auth**: Secure login/registration restricted to `@bennett.edu.in` emails.

### For Outlet Admins (In Development)
- **Order Management**: Real-time dashboard to accept and update order statuses.
- **Menu Control**: Toggle item availability and manage categories.
- **Analytics**: Track daily sales and popular items.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io (for real-time updates).
- **Authentication**: JSON Web Tokens (JWT) with secure local storage.

## 📦 Project Structure

```text
campusbite/
├── server/                # Express Backend
│   ├── models/           # Mongoose Schemas (User, Order, Outlet, etc.)
│   ├── routes/           # API Endpoints (Auth, Orders, Outlets)
│   ├── middleware/       # JWT Auth & Role validation
│   └── utils/            # Seeding & helper functions
└── src/                  # Next.js Frontend
    ├── app/              # App Router (Pages & Layouts)
    ├── components/       # UI & Layout components
    ├── store/            # Context API (Auth, Cart)
    ├── types/            # TypeScript Interfaces
    └── lib/              # Utils & Animations
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd campusbite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory with the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5004
   NEXT_PUBLIC_API_URL=http://localhost:5004
   ```

4. **Run the application**:

   **Option 1: Concurrent (Recommended)**
   ```bash
   npm run dev
   ```

   **Option 2: Separate Terminals**
   - Backend: `npm run dev:server`
   - Frontend: `npm run dev:client`

## 🧪 Testing the Flow

1. **Seeding**: The database automatically seeds with Bennett University outlets (Hotspot, Southern Stories, etc.) on the first run in development mode.
2. **Login**:
   - **Student**: `john@bennett.edu.in` / `student123`
   - **Admin**: `admin@campusbite.com` / `admin123`
3. **Order**: Browse an outlet, add items, and try the **Scheduled Pickup** feature in the cart.

## 📝 Roadmap
- [x] Student Authentication & Profile
- [x] Outlet & Menu Browsing
- [x] Cart & Order Placement (Instant/Scheduled)
- [x] Order History & Tracking
- [ ] Outlet Admin Dashboard
- [ ] Push Notifications for Order Status
- [ ] Super Admin Analytics Panel

## 📄 License
This project is developed for Bennett University campus use.
