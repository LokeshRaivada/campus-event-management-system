# GMRIT Event Management System

An advanced, full-stack Event Management System tailored for GMRIT. This platform streamlines event discovery, student registration, club management, and administrative approvals, providing a seamless experience for students, event organizers, and super admins.

## 🌟 Key Features

- **Multi-Role Authentication**: Distinct portals and capabilities for Students, Admins (Club Leads), and Super Admins.
- **Event Discovery & Registration**: Students can effortlessly browse technical workshops, cultural fests, and hackathons, and register with a single click.
- **QR Code Check-In**: Seamless event entry validation using QR code scanning for quick attendance tracking.
- **Real-Time Notifications**: Instant updates on event approvals, registrations, and club announcements.
- **Comprehensive Analytics**: Interactive dashboards for admins to monitor registrations, approval rates, and user engagement metrics.

## 📸 Platform Previews

### 🏠 Homepage
Discover, register, and participate in campus events.

![Homepage](./docs/homepage.png)

### 📊 Super Admin Analytics
Platform overview and performance metrics across all clubs and events.

![Super Admin Analytics](./docs/super-admin-analytics.png)

### 🛡️ Super Admin Dashboard
Manage pending approvals and oversee platform activity.

![Super Admin Dashboard](./docs/super-admin-dashboard.png)

### 🛠️ Admin Dashboard
Manage club events, view registrations, and handle day-to-day operations.

![Admin Dashboard](./docs/admin-dashboard.png)

### 📱 Event Entry Validation
Scan student QR codes to verify registration and mark attendance.

![Event Entry Validation](./docs/event-entry-validation.png)

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Key Libraries**: Socket.io (Real-time features), Multer (File Uploads), Nodemailer (Email services), JSONWebToken (Auth)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Event-Management-System
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   - Configure your `.env` file in the `server` directory (includes MySQL credentials, JWT secret, and email settings).

5. **Start the Development Servers**
   - **Backend**: In the `server` directory, run `npm start` (or `node index.js`).
   - **Frontend**: In the `client` directory, run `npm run dev`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

---
*Note: The images referenced above are expected to be located in the `docs` folder at the root of the repository.*
