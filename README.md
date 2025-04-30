
# 🌍 Packify – Travel Package Booking Frontend

This is the frontend of the **Packify** web app – a full-stack travel package booking platform with admin and user roles, built using **React.js** and **Tailwind CSS**.

## 🚀 Live Link

[Frontend Hosted on Vercel](https://packify-peach.vercel.app)

---

## ⚙️ Tech Stack

- **React.js**
- **Vite**
- **Tailwind CSS**
- **Axios**
- **JWT Auth**
- **Google OAuth**

---

## 🔑 Features

### 🧑‍💼 Admin
- Login (email/password)
- Manage Travel Packages (Add/Edit/Delete)
- View All Users & Their Bookings
- Package Status (Upcoming, Active, Completed)
- Booking Count Analytics

### 👤 User
- Signup/Login (Email & Google OAuth)
- View & Search Travel Packages
- Sort by Price
- Customize (Food, Accommodation)
- Book Travel Package
- View Profile & Bookings (Upcoming, Active, Completed)

---

## 📦 Environment Variables

Create a `.env` file in the root with:

VITE_BACKEND=https://packify-backend.onrender.com

yaml
Copy
Edit

---

## 🔧 Setup Instructions

```bash
git clone https://github.com/your-username/packify-frontend.git
cd packify-frontend
npm install
npm run dev
📸 Demo Screenshots
 Login/Signup Flow

 Admin Dashboard

 Package Search & Booking

 Profile & Booking History

📁 Folder Structure
bash
Copy
Edit
src/
│
├── components/        # Reusable UI components
├── pages/             # Main routes (Home, Login, Admin etc.)
├── services/          # Axios API logic
├── utils/             # Utility functions
📜 License
MIT – Feel free to fork and build on top!