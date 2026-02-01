# 🍲 MessMate - AI-Powered Mess Management Ecosystem

![MessMate Hero](https://img.shields.io/badge/Status-Hackathon%20Winner-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **"Don't just eat. Vote, Rate, and Save the Planet."** > An ecosystem that combines **Gamification**, **IoT Simulation**, and **AI Analytics** to solve the #1 problem in college hostels: **Food Wastage**.

---

## 🚨 The Problem
- **Food Wastage:** Colleges waste **kg's of food daily** because chefs guess attendance.
- **Boring Feedback:** Students hate filling out Google Forms, so quality never improves.
- **No Accountability:** Complaints vanish into a "suggestion box" black hole.

## 💡 The Solution: MessMate
MessMate is not just a form; it's a **Digital Ecosystem**.
1.  **For Students:** A Swiggy-style app that makes rating meals fun and democratic.
2.  **For Admins:** A "Mission Control" dashboard that connects **Taste Ratings** to **Wastage Metrics** in real-time.

---

## ✨ Key Features (The "Wow" Factor)

### 📱 Student App (Gamified & Appetizing)
- **🔥 Menu Tinder:** Democratizing the kitchen! Students swipe/vote for tomorrow's special dish. (High engagement).
- **🪙 Mess Wallet:** "Rate to Earn." Every review earns **Mess Coins** redeemable for treats.
- **📸 AI Smart Camera:** Upload a photo of the food, and our system simulates an **AI Verification** check to prevent spam.
- **🛑 Wastage RSVP:** A one-tap toggle ("Skipping Meal") that instantly tells the kitchen to cook less.

### 💻 Admin Command Center (The Brain)
- **📡 IoT Smart Dustbin:** A dashboard card simulating a **Real-Time Weight Sensor** stream from the dustbins. Alerts staff if wastage hits critical levels.
- **🧠 Kitchen AI Prediction:** Analyzes RSVP data to give chefs precise instructions: *"Cook 15kg less Rice today."*
- **📊 Correlation Engine:** Proves the link between **Bad Taste** and **High Wastage** using dual-axis charts.
- **🤖 AI Menu Copilot:** Auto-generates alerts like *"🚨 Critical Hygiene Issue Detected"* based on user tags.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS |
| **Backend / DB** | Firebase Firestore (Real-time NoSQL) |
| **Auth** | Firebase Google Authentication |
| **Analytics** | Chart.js |
| **Icons** | Lucide React |

---

## 🚀 Installation & Setup

Follow these steps to run MessMate locally:

**1. Clone the Repository**
```bash
git clone [https://github.com/Abhay109z/messmate.git](https://github.com/Abhay109z/messmate.git)
cd messmate

## 2. Install Dependencies

npm install

## 3. Configure Firebase

Create a project on Firebase Console.

Enable Authentication (Google Sign-In).

Enable Firestore Database.

Create a file named .env in the root directory and add your Firebase config:

Code snippet

VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PROJECT_ID=your_project_id
... (other firebase keys)

## 4. Start the Server

npm run dev

## 5. Login

Open http://localhost:5173.

Admin Access: Login with the email configured in App.jsx (currently set to yours).

Student Access: Login with any other Google account.

## 🔮 Future Scope
Blockchain Rewards: Convert "Mess Coins" into a campus crypto-token.

Computer Vision 2.0: Real AI that identifies specific wasted items (e.g., "Leftover Dal") from photos.

Vendor Integration: Auto-order raw materials based on the "Kitchen AI Prediction" to automate inventory.

## 🤝 Contribution
Got a crazy idea? Fork the repo and submit a PR!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

## 📄 License
Distributed under the MIT License. See LICENSE for more information.

