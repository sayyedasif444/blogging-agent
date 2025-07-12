# Blog Tool Authentication Setup

This guide will help you set up the custom authentication system for the Dev & Debate Blog Tool.

## Prerequisites

1. A Firebase project
2. Node.js and npm installed
3. The blog tool project cloned

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "devanddebate-blogtool")
4. Follow the setup wizard

### 2. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web app icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the configuration object

### 4. Set Environment Variables

Create a `.env.local` file in the blogtool directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Configuration (if not already set)
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Development Server

```bash
npm run dev
```

## Features

### Custom Authentication
- Email/password authentication using Firestore collection
- User session management with localStorage
- Protected routes
- No Firebase Auth required

### Credit System
- New users get 2 free credits
- Credits reset every 24 hours
- Real-time credit tracking
- Credit consumption on blog generation

### User Management
- User data stored in `blogtool_auth` Firestore collection
- Credit tracking and reset times
- Last login tracking

## Database Structure

The system uses a `blogtool_auth` collection in Firestore with the following structure:

```typescript
interface UserData {
  email: string;
  password: string; // In production, this should be hashed
  credits: number;
  resetTime: Date;
  createdAt: Date;
  lastLoginAt: Date;
}
```

## Security Rules

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogtool_auth/{document} {
      allow read, write: if true; // For development - change for production
    }
  }
}
```

## How It Works

1. **User Registration**: Creates a new document in `blogtool_auth` collection
2. **User Login**: Queries the collection by email and validates password
3. **Session Management**: Stores user data in localStorage
4. **Credit System**: Tracks and updates credits in Firestore
5. **Protected Routes**: Checks localStorage for authentication

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check that all environment variables are set correctly
2. **Authentication errors**: Ensure Firestore database is created and accessible
3. **Database errors**: Check Firestore security rules and database creation
4. **Credit system not working**: Verify the user document structure in Firestore

### Testing

1. Create a new account with email/password
2. Verify credits are set to 2
3. Generate a blog and check credit reduction
4. Test credit reset after 24 hours
5. Verify logout functionality

## Production Deployment

For production deployment:

1. Set up proper Firestore security rules
2. Hash passwords before storing (implement bcrypt or similar)
3. Set up proper environment variables in your hosting platform
4. Consider implementing rate limiting
5. Set up monitoring and logging
6. Implement proper session management with JWT tokens 