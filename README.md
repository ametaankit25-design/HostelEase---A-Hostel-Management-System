# HostelEase - A Hostel Management System

A comprehensive hostel management system built with MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
HostelEase/
├── Backend/          # Node.js + Express backend
├── Frontend/         # React frontend
└── README.md
```

## Backend Setup

### Local Development

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in Backend directory with:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

4. Start development server:
```bash
npm run dev
```

### Deployment on Render

#### Option 1: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: hostelease-backend
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `NODE_ENV=production`

#### Option 2: Using render.yaml (Infrastructure as Code)

The `render.yaml` file is already configured. Just:
1. Push to GitHub
2. Connect repository to Render
3. Add environment variables in Render dashboard

## Frontend Setup

### Local Development

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in Frontend directory with:
```env
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

### Deployment

Build the frontend:
```bash
cd Frontend
npm run build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- Render Static Site

## Features

- 🔐 User Authentication (Students & Admin)
- 🏠 Room Management & Allotment
- 💰 Payment Tracking
- 📝 Report Management
- 📊 Dashboard Analytics
- 📧 Email Notifications

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer

**Frontend:**
- React
- Vite
- TailwindCSS
- React Router

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report

## License

MIT
