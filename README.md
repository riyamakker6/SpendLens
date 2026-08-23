# SpendLens 💸

### Subscription Overlap & Cost Leak Detector

SpendLens is a web app that helps users track their subscriptions and understand where their money is going each month.

The idea is simple: people often have multiple subscriptions and don't realize how much they spend on them altogether. SpendLens puts everything in one place and helps users identify overlapping services, unnecessary expenses, and ways to stay within their budget.It also gives users a quick and simple way to see their spending patterns and make smarter financial decisions.

---

## What does SpendLens do?

Users can:

* Add and manage subscriptions
* Track monthly and yearly spending
* Organize subscriptions by category
* Detect possible subscription overlaps
* Identify potential cost leaks
* Set a monthly budget
* Get personalized recommendations
* Find a combination of subscriptions that fits their budget

The main question SpendLens tries to answer is:

**"Where is my subscription money going, and what can I cut?"**

---

## Why did we make this?

It's easy to forget about recurring payments.

For example, having Netflix, Spotify, Prime, Disney+, and YouTube individually might not seem expensive. But together, these subscriptions can add up to a significant yearly amount.

SpendLens helps users see the bigger picture and decide which subscriptions are actually worth keeping.

---

# Main Features

## 🔐 Login & Signup

Users can create an account and access their own subscription data.

## ➕ Subscription Management

Users can add, edit, and remove subscriptions by entering:

* Name
* Category
* Price
* Billing cycle

## 📊 Dashboard

The dashboard provides an overview of:

* Total subscriptions
* Monthly spending
* Yearly spending
* Budget
* Potential savings

## 🔄 Billing Cycle Normalization

Weekly, monthly, and yearly subscriptions are converted into a common format so their costs can be compared properly.

For example:

**₹500/month → ₹6,000/year**

## 🔀 Overlap Detection

SpendLens identifies subscriptions that belong to similar categories, such as multiple streaming or music services.

It flags potential overlaps so the user can decide whether they need all of them.

## 💸 Cost Leak Detection

The app highlights possible unnecessary spending, such as unused subscriptions, duplicate services, or subscriptions that don't fit the user's budget.

## 🎯 Budget Optimization

Users can set a monthly spending limit. SpendLens compares their current spending with the limit and suggests ways to reduce it.

## 🧠 "What Should I Keep?"

This feature recommends a possible combination of subscriptions that stays within the user's chosen budget.

The recommendations are meant to help with decision-making rather than automatically cancelling anything.

---

# 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Concepts Used

* DOM Manipulation
* Local Storage
* Billing-cycle calculations
* Category-based comparison
* Overlap detection
* Budget optimization
* Recommendation logic

---

# 📱 Website Sections

* **Landing Page** — Introduction to SpendLens
* **Login / Signup** — User authentication
* **Dashboard** — Spending overview
* **Subscription Management** — Add, edit, and remove subscriptions
* **Analysis** — Spending and overlap analysis
* **Recommendations** — Budget and subscription suggestions

---

# 📂 Project Structure

SpendLens/
│
├── index.html
├── login.html
├── dashboard.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── script.js
│   ├── auth.js
│   ├── subscriptions.js
│   └── analysis.js
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md

---

# ▶️ How to Run

### 1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL

### 2. Open the project

cd SpendLens

### 3. Run the application

Open the main HTML file in a browser, or use **VS Code + Live Server** for development.

---

# 🚀 Future Improvements

* Backend database
* Improved authentication
* Automatic subscription detection
* Bank statement integration
* Renewal reminders
* Price-change alerts
* More advanced recommendation algorithms
* Machine-learning-based personalization
* Mobile application

---

# 👥 Team

**SpendLens Team**

A web application project focused on subscription analytics, budget optimization, and recommendation systems.

---

# 📌 Final Note

SpendLens started with a simple idea:

**We have too many subscriptions, and it's easy to lose track of them.**

Instead of just showing users what they're paying for, SpendLens helps them understand their spending and make better decisions about what to keep.
