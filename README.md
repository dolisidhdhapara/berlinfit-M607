# BerlinFit

A web application for a Fitness Class Scheduling & Membership System for a single personal trainer who owns a small studio in Berlin.

## Features
- **User Roles**: Admin (Trainer) and Members.
- **Authentication**: Simple session-based login (Plain text passwords for assignment simplicity).
- **Membership Plans**: Admin manages plans; Members view and purchase them.
- **Class Scheduling**: Admin creates classes and sessions; Members view schedule.
- **Booking System**: Members book classes (requires active membership).
- **Payments**: PayPal Sandbox integration for membership purchases.

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1.  **Node.js**: [Download and Install Node.js](https://nodejs.org/) (LTS version recommended).
2.  **MongoDB**: [Download and Install MongoDB Community Server](https://www.mongodb.com/try/download/community).
    - Ensure MongoDB is running locally (usually on port 27017).
3.  **PayPal Sandbox Account**:
    - Go to [PayPal Developer Dashboard](https://developer.paypal.com/).
    - Log in and create a **Sandbox Business Account** (for the app) and a **Sandbox Personal Account** (for testing payments).
    - Get your **Client ID** and **Client Secret** from the Business Account app settings.

---

## Setup Instructions

### 1. Clone or Download the Project
If you have Git installed:
```bash
git clone <repository-url>
cd berlinfit
```
Or download the ZIP file and extract it.

### 2. Install Dependencies
Open your terminal (Command Prompt, PowerShell, or Terminal) in the project folder and run:
```bash
npm install
```
This will install all the necessary libraries listed in `package.json`.

### 3. Configure Environment Variables
Create a new file named `.env` in the root folder of the project. A sample `.env` configuration is provided below. You can use a local MongoDB instance or a cloud provider like MongoDB Atlas.

```env
# Server Port (default: 5000)
PORT=5000

# MongoDB Connection String
# Local Example: mongodb://localhost:27017/berlinfit
# Atlas Example: mongodb+srv://<username>:<password>@cluster0.mongodb.net/berlinfit?retryWrites=true&w=majority
MONGO_URI=mongodb://localhost:27017/berlinfit

# PayPal Sandbox Credentials
# Replace these with your actual credentials from PayPal Developer Dashboard
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
```

### 4. Start the Server
Run the following command to start the backend server locally:

```bash
npm start
```
*Note: This runs `node src/server.js`.*

You should see output like:
```
Server running on port 5000
MongoDB Connected: localhost
Admin user seeded.
```

---

## Production Deployment

To run this project in a production environment:

### 1. Environment Setup
Ensure your production server has Node.js and npm installed.

### 2. Environment Variables
Set the environment variables on your server or in your deployment configuration (e.g., Heroku Config Vars, Docker env, etc.).
**Crucially**, ensure you use a secure, production-ready MongoDB connection string (e.g., MongoDB Atlas) and your live PayPal Client ID/Secret.

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://... (Your Production Database)
PAYPAL_ENV=live (If ready for real payments)
```

### 3. Install Production Dependencies
Run:
```bash
npm install --production
```

### 4. Run the Application
It is recommended to use a process manager like **PM2** to keep the application running.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start src/server.js --name "berlinfit"
```

### Deployment URL
Once deployed, your application will be accessible at your server's IP or domain, e.g.:
`https://your-app-name.herokuapp.com` or `http://your-server-ip:5000`

---

## How to Use (Frontend & Testing)

This project includes a frontend interface served by the backend. You can interact with the application directly in your browser.

### 1. Access the Application
Open your browser and navigate to:
`http://localhost:5000`

This will load the **Landing Page** (`index.html`).

### 2. User Actions
-   **Register**: Go to the registration page or click "Join Now" to create a Member account.
-   **Login**: Log in with your Member credentials or the Admin credentials.
-   **Dashboard**:
    -   **Members**: View available classes, purchase memberships, and book sessions.
    -   **Admin**: Manage plans, create class types, and schedule sessions (`admin.html`).

### 3. API Testing
You can still test the API endpoints directly using **Postman** or **Insomnia** if needed.

### 4. Initial Admin Login
The system automatically creates an admin user if one doesn't exist.
- **Email**: `admin@berlin-fit.de`
- **Password**: `admin123`

### 5. API Endpoints Overview

#### Authentication
- `POST /api/auth/register`: Register a new member.
- `POST /api/auth/login`: Login (returns session cookie).
- `POST /api/auth/logout`: Logout.

#### Membership Plans (Admin)
- `POST /api/plans`: Create a plan.
- `GET /api/plans`: List active plans (Public).

#### Payments (PayPal)
1.  **Login** as a Member.
2.  **Create Order**: `POST /api/payments/create-order` with `{ "planId": "..." }`.
3.  **Approve**: Open the returned `approve` link in a browser and login with your PayPal Sandbox Personal Account.
4.  **Capture**: `POST /api/payments/capture-order` with `{ "orderId": "..." }`.
    - This activates your membership.

#### Classes & Booking
- `POST /api/admin/class-types`: Create a class type (Admin).
- `POST /api/admin/class-sessions`: Schedule a session (Admin).
- `GET /api/schedule/upcoming`: View schedule (Public).
- `POST /api/bookings`: Book a class (Member, requires active membership).

---

## Troubleshooting

- **MongoDB Error**: Ensure MongoDB service is running. Try `mongod` in a separate terminal.
- **PayPal Error**: Check if your Client ID and Secret are correct in `.env`. Ensure `PAYPAL_ENV` is set to `sandbox`.
- **Login Fails**: Ensure you are using the correct email/password. Remember passwords are case-sensitive (and plain text in this version).
