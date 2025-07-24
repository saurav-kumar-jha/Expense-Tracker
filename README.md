## 💸 Welcome to your Expense Tracker App

A fully functional **React Native (Expo) + Firebase** app to track your income and expenses across multiple wallets. It features beautiful charts, authentication, and real-time data updates using Firestore.

🔒 Auth, 💰 Wallets, 📊 Charts — all in one place.

## 🚀 Features

- 🔐 User Authentication (Firebase Auth)
- 👛 Create & Manage Multiple Wallets
- ➕ Add / Remove Income & Expenses
- 📅 Track Weekly, Monthly, Yearly Trends
- 📈 Visualize Data using Beautiful Charts
- 📄 View All Transactions with History
- 💾 Persistent Storage with Firestore
- 🎨 Clean UI & Tailwind Styling (via NativeWind)

## Get started

1. Clone the repo
   ```bash
    git clone https://github.com/saurav-kumar-jha/Expense-Tracker.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## 📁 Project Structure
 src/
├── auth/ # Authentication: Welcome, Login, Register screens
├── components/ # Reusable UI components
├── context/ # Auth and App context providers
├── screens/ # Main app views: Dashboard, AddTransaction, Wallets, Charts
├── utils/ # Firebase config, helper methods
├── assets/ # App assets: images, icons


---

## 🔧 Tech Stack

| Category        | Technology                |
|-----------------|---------------------------|
| Framework       | React Native (Expo)       |
| Auth            | Firebase Authentication   |
| Database        | Firebase Firestore        |
| Navigation      | Expo Router               |
| Charts          | Victory Native / Recharts |
| State           | Context API, useState     |
| Styling         | NativeWind / StyleSheet   |
| Storage         | AsyncStorage              |

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Add your web config in `firebaseConfig.ts`

```ts
// src/utils/firebaseConfig.ts
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

