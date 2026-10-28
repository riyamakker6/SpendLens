# SpendLens 💸

### Subscription Overlap & Cost Leak Detector

SpendLens is a full-stack web application that helps users track their subscriptions, understand their spending, detect overlapping services, identify potential cost leaks, and make better budget decisions.

The project started as a frontend-based application using **HTML, CSS, JavaScript, and Local Storage**. It has now been extended into a complete backend-powered application using **Node.js, Express.js, MongoDB, and Mongoose**.

Instead of storing important user and subscription data only in the browser, SpendLens now securely communicates with a backend API and stores application data in **MongoDB**.

The main question SpendLens tries to answer is:

> **"Where is my subscription money going, and what can I cut?"**

---

# 🚀 What Does SpendLens Do?

Users can:

- Create an account
- Log in securely
- Add subscriptions
- View subscriptions
- Edit subscriptions
- Delete subscriptions
- Track monthly and yearly spending
- Organize subscriptions by category
- Detect possible subscription overlaps
- Identify potential cost leaks
- Set a monthly budget
- Get personalized recommendations
- Find subscription combinations that fit their budget

All major operations are now handled through **REST APIs** connected to a MongoDB database.

---

# 💡 Why Did We Make SpendLens?

It is easy to forget about recurring payments.

For example, having:

- Netflix
- Spotify
- Prime
- Disney+
- YouTube

individually might not seem expensive.

But when all these subscriptions are combined, they can become a significant monthly and yearly expense.

SpendLens brings all subscriptions into one place and helps users understand:

- How much they are spending
- Which services overlap
- Where money may be getting wasted
- Which subscriptions could potentially be removed
- Whether their spending fits within their budget

---

# ✨ Main Features

## 🔐 1. User Authentication

Users can create an account and securely log in to access their personal subscription data.

Authentication functionality includes:

- Signup
- Login
- Logout
- Protected routes
- Password hashing using bcrypt
- Authentication using JWT/session-based mechanisms

Each user's subscription data is associated with their account.

---

## ➕ 2. Subscription Management

Users can manage their subscriptions through the application.

Each subscription can contain information such as:

- Name
- Category
- Price
- Billing cycle

Users can:

- Add subscriptions
- View subscriptions
- Update subscriptions
- Delete subscriptions

These operations are performed using REST APIs.

---

## 📊 3. Dashboard

The dashboard provides an overview of the user's subscription spending.

It displays:

- Total number of subscriptions
- Monthly spending
- Yearly spending
- Current budget
- Potential savings
- Spending patterns

This gives users a quick understanding of their overall subscription expenses.

---

## 🔄 4. Billing Cycle Normalization

Different subscriptions can have different billing cycles.

SpendLens converts these into a common format so they can be compared properly.

For example:

**₹500/month → ₹6,000/year**

Similarly, weekly, monthly, quarterly, and yearly subscriptions can be normalized for analysis.

---

## 🔀 5. Subscription Overlap Detection

SpendLens identifies subscriptions that belong to similar categories.

For example:

**Streaming:**

- Netflix
- Prime Video
- Disney+

**Music:**

- Spotify
- YouTube Music

The application highlights possible overlaps so users can decide whether they actually need multiple similar services.

---

## 💸 6. Cost Leak Detection

SpendLens identifies possible sources of unnecessary spending.

Examples include:

- Multiple subscriptions providing similar services
- Expensive subscriptions
- Subscriptions exceeding the user's budget
- Potentially unnecessary recurring expenses

The application highlights these areas so users can make informed decisions.

---

## 🎯 7. Budget Optimization

Users can define a monthly subscription budget.

SpendLens compares the user's current spending with the selected budget.

If spending is higher than the budget, the application can suggest possible ways to reduce expenses.

---

## 🧠 8. "What Should I Keep?"

SpendLens provides recommendation logic that suggests a possible combination of subscriptions based on the user's budget.

The system considers factors such as:

- Subscription price
- Category
- Overlap
- Monthly budget

The recommendations are intended to support decision-making.

The application does **not automatically cancel subscriptions**.

---

# 🖥️ Website Sections

### 🏠 Landing Page

Introduces SpendLens and explains the problem it solves.

### 🔐 Login / Signup

Allows users to create accounts and authenticate themselves.

### 📊 Dashboard

Displays subscription and spending information.

### ➕ Subscription Management

Allows users to add, edit, view, and delete subscriptions.

### 📈 Analysis

Provides spending, overlap, and cost-leak analysis.

### 🧠 Recommendations

Suggests possible subscription combinations based on the user's budget.

---

# 🛠️ Technologies Used

## Frontend

- HTML
- CSS
- JavaScript
- DOM Manipulation
- Fetch API

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- MongoDB Atlas
- Mongoose

## Authentication & Security

- bcrypt
- JWT / Session-based authentication
- Protected Routes
- Environment Variables

## API Development & Testing

- REST APIs
- JSON
- Postman

## Development Tools

- NPM
- package.json
- Nodemon
- Git & GitHub

---

# 🔗 REST API

SpendLens uses REST APIs to communicate between the frontend and backend.

The frontend sends HTTP requests to the Express.js server, and the server processes the request and communicates with MongoDB.

Basic request flow:

```text
Frontend
   ↓
Fetch API
   ↓
Express.js Server
   ↓
Routes & Middleware
   ↓
Controller / Business Logic
   ↓
Mongoose
   ↓
MongoDB
```

The response is then returned back to the frontend in JSON format.

---

# 📡 API Operations

SpendLens supports API operations for authentication and subscription management.

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

### Subscriptions

```text
GET    /api/subscriptions
POST   /api/subscriptions
PUT    /api/subscriptions/:id
DELETE /api/subscriptions/:id
```

These APIs allow the application to perform complete CRUD operations on subscription data.

---

# 🧪 API Testing With Postman

The backend APIs can be tested independently using **Postman**.

For example, users can test:

### Signup

```text
POST /api/auth/signup
```

### Login

```text
POST /api/auth/login
```

### Add Subscription

```text
POST /api/subscriptions
```

### Get Subscriptions

```text
GET /api/subscriptions
```

### Update Subscription

```text
PUT /api/subscriptions/:id
```

### Delete Subscription

```text
DELETE /api/subscriptions/:id
```

This allows the backend functionality to be verified without depending entirely on the frontend.

---

# 🗄️ MongoDB Database

SpendLens now uses **MongoDB** instead of browser Local Storage for persistent application data.

MongoDB stores information such as:

- User accounts
- User authentication information
- Subscription records
- Subscription details
- Budget information

### Mongoose

Mongoose is used as the ODM between Node.js and MongoDB.

It provides:

- Schemas
- Models
- Validation
- Database operations
- Structured data handling

Example conceptual structure:

```text
User
 ├── Name
 ├── Email
 ├── Password
 └── Subscriptions

Subscription
 ├── Name
 ├── Category
 ├── Price
 ├── Billing Cycle
 └── User ID
```

---

# ⚡ JavaScript Concepts Used

The project also demonstrates several important JavaScript concepts.

## Callbacks

Used to understand asynchronous JavaScript operations.

## Promises

Used for handling asynchronous operations.

## Promise Chaining

Used when multiple asynchronous operations depend on one another.

## Async / Await

Used extensively for cleaner asynchronous code.

Example:

```javascript
const response = await fetch("/api/subscriptions");
const data = await response.json();
```

## Error Handling

Errors are handled using:

```javascript
try {
    // operation
} catch (error) {
    // handle error
}
```

Backend middleware is also used for centralized error handling.

---

# 🌐 Fetch API & JSON

The frontend communicates with the backend using the **Fetch API**.

Example request flow:

```text
JavaScript
    ↓
fetch()
    ↓
REST API
    ↓
Express.js
    ↓
MongoDB
    ↓
JSON Response
    ↓
Frontend
```

JSON is used for exchanging data between the frontend and backend.

---

# 🟢 Node.js

Node.js is used to build the backend of SpendLens.

Node.js allows JavaScript to run outside the browser and provides the environment required to create the backend server and APIs.

Important Node.js concepts used/studied during the project include:

- V8 Engine
- Event Loop
- Call Stack
- Callback Queue
- Non-Blocking I/O
- NPM
- Modules
- Environment Variables
- HTTP
- File System
- Path
- EventEmitter
- Buffers
- Streams

---

# 🚂 Express.js

Express.js is used on top of Node.js to simplify backend development.

It is responsible for:

- Creating the server
- Defining routes
- Handling requests
- Sending responses
- Middleware
- REST API development
- Error handling
- Authentication
- CRUD operations

Example architecture:

```text
Node.js
   ↓
Express.js
   ↓
Routes
   ↓
Middleware
   ↓
API Logic
   ↓
Mongoose
   ↓
MongoDB
```

---

# 🧩 Middleware

Express middleware is used to process requests before they reach the final route handler.

SpendLens uses middleware for purposes such as:

- Request processing
- Authentication
- JSON body parsing
- Error handling
- Protected routes

This helps keep the backend organized and maintainable.

---

# 🔒 Protected Routes

Some API endpoints are accessible only to authenticated users.

For example:

```text
Login
   ↓
Authentication
   ↓
Access Token / Session
   ↓
Protected API
   ↓
User's Data
```

This prevents one user from accessing another user's subscription information.

---

# 📁 Project Structure

```text
SpendLens/
│
├── client/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── script.js
│   │   ├── auth.js
│   │   ├── subscriptions.js
│   │   └── analysis.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── server/
│   ├── server.js
│   ├── middleware/
│   ├── routes/
│   ├── models/
│   └── controllers/
│
├── .env
├── package.json
└── README.md
```

> The exact folder structure may vary depending on the current project organization.

---

# ⚙️ Environment Variables

Sensitive configuration values are stored using environment variables instead of being directly written into the source code.

Examples include:

```text
MONGODB_URI
SESSION_SECRET
CLIENT_ORIGIN
NODE_ENV
```

This keeps sensitive configuration separate from the application code.

---

# ▶️ How to Run

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

## 2. Open the Project

```bash
cd SpendLens
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create a `.env` file and add the required configuration values.

```text
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret
CLIENT_ORIGIN=your_frontend_url
NODE_ENV=development
```

## 5. Start the Backend

```bash
npm run dev
```

Nodemon can automatically restart the server whenever changes are made during development.

## 6. Open the Frontend

Open the frontend through the appropriate development server or deployed frontend.

---

# 🧪 Development & Testing Workflow

SpendLens can be tested at multiple levels.

### Frontend Testing

The UI can be used to:

- Signup
- Login
- Add subscriptions
- Edit subscriptions
- Delete subscriptions
- View spending
- Analyze subscriptions

### API Testing

Postman can be used to directly test the backend APIs.

### Database Testing

MongoDB Atlas can be used to verify that user and subscription data is correctly stored and updated.

---

# 🔄 Complete Application Flow

The complete SpendLens flow is:

```text
User
 ↓
Frontend
 ↓
Fetch API
 ↓
Express.js
 ↓
Middleware
 ↓
Authentication
 ↓
Route
 ↓
Mongoose
 ↓
MongoDB
 ↓
JSON Response
 ↓
Frontend
 ↓
Updated UI
```

For example, when a user adds a subscription:

```text
User enters subscription details
             ↓
Frontend sends POST request
             ↓
Express receives request
             ↓
Authentication is checked
             ↓
Subscription data is validated
             ↓
Mongoose creates the database record
             ↓
MongoDB stores the subscription
             ↓
Server sends JSON response
             ↓
Frontend updates the dashboard
```

---

# 🔮 Future Improvements

Possible future improvements include:

- Automatic subscription detection
- Bank statement integration
- Renewal reminders
- Price-change alerts
- Advanced recommendation algorithms
- Machine-learning-based personalization
- Spending prediction
- Mobile application
- Email notifications
- More advanced analytics
- Subscription usage tracking

---

# 👥 Team

**SpendLens Team**

A full-stack web application project focused on:

- Subscription analytics
- Budget optimization
- Overlap detection
- Cost-leak detection
- REST API development
- User authentication
- MongoDB data management
- Recommendation systems

---

# 📌 Final Note

SpendLens started with a simple idea:

> **"We have too many subscriptions, and it's easy to lose track of them."**

The project has now evolved from a simple frontend application into a **full-stack subscription management and analysis system**.

Instead of only storing data locally, SpendLens now uses:

**HTML + CSS + JavaScript → Node.js → Express.js → REST APIs → Mongoose → MongoDB**

This allows users to securely create accounts, log in, manage their subscriptions, and persist their data in a real database.

SpendLens doesn't just show users what they are paying for.

**It helps them understand their spending and make better decisions about what to keep.** 💸
