# 🛡️ EventHub - Premium Event Management System

EventHub is a robust, multi-portal event management platform designed for seamless coordination between Users, Organizers, and Administrators. Featuring a sleek interface and secure session management, EventHub simplifies the complexities of event planning and attendee management.

## 🚀 Key Features

- **Multi-Portal Architecture**: Specialized dashboards for Users, Organizers, and Admins.
- **Secure Authentication**: Role-based access control with secure session destruction on logout.
- **Organizer Workflow**: Approval-based registration flow for event organizers.
- **Admin Command Center**: Complete control over users, organizers, and platform settings.
- **Cloud Integration**: Avatar management powered by Cloudinary.
- **Interactive UI**: Modern, responsive design with dynamic toasting and feedback.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose), Redis (OTP management)
- **Frontend**: EJS Templating, Vanilla CSS, JavaScript
- **Auth**: Passport.js, Express-Session (with MongoStore)
- **Storage**: Cloudinary

## 📦 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB & Redis instances
- Cloudinary Credentials (for avatar features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abnv-8083/EventHub.git
   cd EventHub
   git checkout Week-1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   SESSION_SECRET=your_session_secret
   REDIS_URL=your_redis_url
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📅 Development Progress

| Week | Branch  | Status        | Highlights                                         |
|------|---------|---------------|----------------------------------------------------|
| 1    | Week-1  | ✅ Complete   | User, Admin & Organizer portals, Session Management |

## 🌐 Portal Overview

| Portal    | URL Prefix    | Description                                 |
|-----------|---------------|---------------------------------------------|
| User      | `/`           | Registration, login, profile, organizer application |
| Organizer | `/organizer/` | Event management dashboard                  |
| Admin     | `/admin/`     | Platform administration & approvals         |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
