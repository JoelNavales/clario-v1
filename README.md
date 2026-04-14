# 🧠 Clario — Version 1 (Local Edition)

> A simple, fast, and offline-ready life dashboard for tracking mood, habits, and tasks.

---

## 🚀 Overview

**Clario v1** is the first iteration of the app focused on simplicity and speed.

This version:

* ❌ Has NO backend
* ❌ Has NO login/signup
* ✅ Uses LocalStorage for all data
* ✅ Runs entirely in the browser

👉 Built as a fast MVP to validate core features before scaling to a full backend system.

---

## ✨ Features

### 🧠 Mood Tracking

* Select your daily mood (Happy, Neutral, Stressed)
* One mood entry per day
* Simple weekly overview
* Optional journal notes

---

### 🔁 Habit Tracking

* Create personal habits
* Mark habits as completed daily
* Track streaks locally

---

### ✅ Task Management

* Add and manage tasks
* Mark tasks as complete/incomplete
* Set priority levels
* Basic filtering

---

### 🎨 Theme Personalization

* Light mode
* Dark mode
* Custom theme (e.g., pink 💖)

---

## 🏗️ Tech Stack

* React (JavaScript)
* Tailwind CSS
* LocalStorage (for data persistence)
* React Router (for navigation)

---

## 📁 Project Structure

```id="v1struct"
src/
├── app/
├── components/
├── features/
│   ├── dashboard/
│   ├── mood/
│   ├── habits/
│   ├── tasks/
│   └── insights/
├── hooks/
├── utils/
├── styles/
└── lib/
```

---

## 💾 Data Storage (LocalStorage)

All data is stored in the browser using `localStorage`.

### Example Keys:

```js id="v1storage"
clario_moods
clario_habits
clario_tasks
clario_insights
clario_theme
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash id="v1clone"
git clone <your-repo-url>
cd clario
```

### 2. Install dependencies

```bash id="v1install"
npm install
```

### 3. Run the app

```bash id="v1run"
npm run dev
```

---

## ⚠️ Limitations

* Data is stored only on the device
* No user accounts
* No cloud sync
* Data will be lost if:

  * browser storage is cleared
  * user switches devices

---

## 🧠 Purpose of Version 1

Clario v1 is designed to:

* Validate core user experience
* Test feature usability
* Build fast without backend complexity

---

## 🔄 Upgrade Path (to Version 2)

Clario v2 introduces:

* Supabase backend
* User authentication
* Cloud data storage
* AI-powered insights
* Multi-device support

---

## 💡 Philosophy

> *Start simple. Improve with clarity.*

Clario v1 focuses on helping users build awareness of their daily habits without complexity.

---

## 👨‍💻 Author

Built by **Joel Navales**

---

## 📌 Version

**Clario v1**

* LocalStorage-based
* No authentication
* Fully frontend

---

## 📄 License

This project is for educational and personal use.
