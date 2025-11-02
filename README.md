# VillageVault - Unified Village Communication System

A mobile-based digital platform designed to bridge the communication gap between rural communities and local governance. Built as a community service project by students from the Department of Artificial Intelligence & Data Science at Vasireddy Venkatadri Institute of Technology.

## 🌟 Features

### Core Functionality
- **Dual Interfaces**: Separate interfaces for Sarpanch (village heads) and Villagers
- **PIN Code-Based Registration**: Users register using their PIN code and village name
- **Multi-Channel Alerts**: Real-time notifications via in-app, SMS, and missed calls
- **Multilingual Support**: Available in Telugu, Hindi, and English with dynamic language switching
- **SOS Emergency Feature**: Quick emergency reporting system with priority levels
- **Two-Way Communication**: Direct messaging between villagers and sarpanch
- **Real-time Dashboard**: Live statistics and activity monitoring
- **Weather Integration**: Location-based weather information widget
- **Offline Support**: Offline indicator and graceful degradation
- **File Upload Support**: Image sharing capabilities
- **Scheduled Alerts**: Future-dated and recurring alert functionality
- **Village Statistics**: Comprehensive village activity and engagement metrics

### Advanced Features
- **Firebase Integration**: Cloud storage for files and real-time data sync
- **Socket.IO Real-time**: Live notifications, messages, and status updates
- **Responsive Design**: Mobile-first design with PWA capabilities
- **Role-based Access Control**: Different permissions for Sarpanch and Villagers
- **Alert Delivery Tracking**: Multi-channel delivery status monitoring
- **Conversation Management**: Organized message threads and read receipts
- **Emergency Priority System**: Multi-level priority classification for alerts and SOS

### Key Benefits
- **Transparency**: Clear communication channels between governance and community
- **Quick Response**: Immediate alert delivery and emergency reporting
- **Inclusive Experience**: Multilingual support and accessibility features
- **Real-time Updates**: Live notifications and status updates
- **Scalable Architecture**: Cloud-ready with Firebase and modern tech stack
- **User-friendly Interface**: Intuitive design with offline capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript (TSX)
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for HTTP requests
- **i18next & react-i18next** for internationalization
- **Firebase** for file storage and authentication
- **clsx & tailwind-merge** for conditional styling

### Backend
- **Node.js** with JavaScript
- **Express.js** for API framework
- **Prisma** as ORM
- **PostgreSQL** as database
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Joi** for validation
- **Firebase Admin SDK** for cloud services
- **Twilio** for SMS and missed call notifications
- **Node-cron** for scheduled tasks
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express Rate Limit** for API rate limiting

### Database
- **PostgreSQL** with comprehensive schema for:
  - Users (Sarpanch/Villagers)
  - Villages and PIN codes
  - Alerts and delivery tracking
  - Messages (text, voice, image)
  - SOS reports
  - Multilingual translations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd villagevault
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Update the following variables in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/villagevault"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Twilio (for SMS and missed calls)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="your-twilio-phone-number"
   
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 5173) servers.

### Alternative: Run servers separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📱 Usage

### Registration Process
1. **Villagers**: Register with phone number, name, PIN code, and village name
2. **Sarpanch**: Same registration process, but only one sarpanch per village
3. **OTP Verification**: Phone number verification via OTP
4. **Village Assignment**: Automatic assignment to village based on PIN code

### Key Features Usage

#### For Sarpanch:
- **Create Alerts**: Send alerts to all villagers in the village
- **Multi-Channel Delivery**: Choose between in-app, SMS, or missed calls
- **Scheduled Alerts**: Set alerts for future delivery
- **Repeated Alerts**: Set up recurring alerts (daily, weekly, monthly)
- **SOS Management**: View and manage emergency reports from villagers
- **Village Statistics**: Monitor village activity and engagement

#### For Villagers:
- **Receive Alerts**: Get real-time notifications from sarpanch
- **Send Messages**: Direct communication with sarpanch
- **SOS Reports**: Report emergencies quickly
- **Village Information**: View village details and members

## 🏗️ Project Structure

```
villagevault/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js      # Authentication endpoints
│   │   │   ├── alerts.js    # Alert management
│   │   │   ├── messages.js  # Messaging system
│   │   │   ├── sos.js       # Emergency reports
│   │   │   ├── users.js     # User management
│   │   │   └── villages.js  # Village information
│   │   ├── middleware/      # Authentication & error handling
│   │   │   ├── auth.js      # JWT authentication
│   │   │   ├── errorHandler.js # Error handling
│   │   │   └── notFound.js  # 404 handler
│   │   ├── services/        # Business logic
│   │   │   ├── alertService.js # Alert processing
│   │   │   └── firebaseService.js # Firebase integration
│   │   ├── socket/          # Socket.IO handlers
│   │   │   └── socketHandlers.js # Real-time communication
│   │   ├── config/          # Configuration files
│   │   │   └── firebase.js  # Firebase configuration
│   │   └── index.js         # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── env.example          # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Header.tsx   # Navigation header
│   │   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   │   ├── Layout.tsx   # Main layout wrapper
│   │   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   │   ├── OfflineIndicator.tsx # Network status
│   │   │   ├── WeatherWidget.tsx # Weather information
│   │   │   └── LanguageSelector.tsx # Language switcher
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   ├── Login.tsx    # User login
│   │   │   ├── Register.tsx # User registration
│   │   │   ├── VerifyOTP.tsx # OTP verification
│   │   │   ├── Alerts.tsx   # Alert management
│   │   │   ├── Messages.tsx # Messaging interface
│   │   │   ├── SOS.tsx      # Emergency reporting
│   │   │   ├── Profile.tsx  # User profile
│   │   │   └── VillageInfo.tsx # Village details
│   │   ├── contexts/       # React contexts
│   │   │   ├── AuthContext.tsx # Authentication state
│   │   │   ├── LanguageContext.tsx # Internationalization
│   │   │   └── SocketContext.tsx # Real-time communication
│   │   ├── services/       # API services
│   │   │   └── api.ts      # HTTP client configuration
│   │   ├── config/         # Configuration files
│   │   │   └── firebase.ts # Firebase client config
│   │   ├── main.tsx        # App entry point
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   ├── env.example         # Environment variables template
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── vite.config.ts      # Vite configuration
│   └── package.json
└── package.json            # Root package.json with scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with phone number validation
- `POST /api/auth/login` - User login with OTP generation
- `POST /api/auth/verify-otp` - OTP verification and JWT token generation
- `GET /api/auth/me` - Get current authenticated user details
- `POST /api/auth/refresh` - Refresh JWT token

### Alerts
- `POST /api/alerts` - Create alert with multi-channel delivery (Sarpanch only)
- `GET /api/alerts` - Get alerts with pagination and filtering
- `GET /api/alerts/:id` - Get specific alert details
- `PUT /api/alerts/:id` - Update alert (Sarpanch only)
- `DELETE /api/alerts/:id` - Delete alert (Sarpanch only)
- `POST /api/alerts/:id/deliver` - Trigger alert delivery to all channels

### Messages
- `POST /api/messages` - Send text or image message
- `GET /api/messages` - Get messages with pagination
- `GET /api/messages/conversations` - Get conversation threads
- `PATCH /api/messages/:id/read` - Mark message as read
- `GET /api/messages/:id` - Get specific message details

### SOS Reports
- `POST /api/sos` - Create emergency SOS report
- `GET /api/sos` - Get SOS reports with filtering
- `GET /api/sos/:id` - Get specific SOS report details
- `PATCH /api/sos/:id/status` - Update SOS status (Sarpanch only)
- `PATCH /api/sos/:id/priority` - Update SOS priority level

### Users & Villages
- `GET /api/users/village` - Get users in same village
- `GET /api/users/village/stats` - Get comprehensive village statistics
- `PUT /api/users/profile` - Update user profile information
- `GET /api/users/:id` - Get specific user details
- `GET /api/villages/search` - Search villages by PIN code
- `GET /api/villages/current` - Get current village information
- `GET /api/villages/:pinCode` - Get village details by PIN code

### File Upload
- `POST /api/upload/image` - Upload image files to Firebase Storage
- `DELETE /api/upload/:filename` - Delete uploaded files

## 🌐 Multilingual Support

The application supports three languages:
- **English** (en)
- **Hindi** (hi) - हिन्दी
- **Telugu** (te) - తెలుగు

Language switching is available in the header, and all UI text is translated accordingly.

## 📡 Real-time Features

- **Socket.IO Integration**: Real-time notifications and updates
- **Live Alerts**: Instant alert delivery
- **Message Notifications**: Real-time message notifications
- **SOS Alerts**: Immediate emergency notifications to sarpanch
- **Status Updates**: Live status updates for SOS reports

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **OTP Verification**: Phone number verification
- **Role-based Access**: Different permissions for Sarpanch and Villagers
- **Input Validation**: Comprehensive input validation using Joi
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing protection

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy backend to your server
5. Deploy frontend to your hosting service

### Docker Support (Optional)
You can containerize the application using Docker for easier deployment.

## 🤝 Contributing

This is a community service project. Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**Department of Artificial Intelligence & Data Science**  
**Vasireddy Venkatadri Institute of Technology**

**Project Team:**
- G. Veena Madhuri (22BQ1A5444)
- G. Gayathri (22BQ1A5449)
- B. Vijay (22BQ1A5421)
- B. Rohini (22BQ1A5409)
- D. Thilak Nikilesh (22BQ1A5434)

**Under the guidance of:** Mrs. K. Sandhya Rani, Assistant Professor, VVIT, Nambur

## 📞 Support

For support or questions about this project, please contact the development team or create an issue in the repository.

---

**VillageVault** - Bridging the communication gap in rural communities through technology.
