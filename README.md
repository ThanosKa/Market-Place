# C2C Marketplace App

## Project Overview

This is a full-stack C2C (Consumer-to-Consumer) marketplace application built with React Native Expo for the frontend and Node.js with MongoDB for the backend. The app allows users to upload products, view, buy, sell, leave live reviews, and engage in social activities like chatting.

## Features

- User authentication
- Product listing and management
- Buy and sell functionality
- Live product reviews
- Social features including chat
- Activity feed

## Tech Stack

### Frontend

- React Native
- Expo
- TypeScript
- React Navigation
- React Query
- i18next for internationalization
- Axios for API calls
- React Hook Form with Yup for form validation

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- TypeScript
- JWT for authentication
- Multer for file uploads
- Swagger for API documentation

## Prerequisites

- Node.js (version specified in package.json)
- Expo CLI
- MongoDB

## Installation

### Frontend

1. Navigate to the frontend directory:
   cd frontend
2. Install dependencies:
   npm install
3. Start the Expo development server:
   npm start

### Backend

1. Navigate to the backend directory:
   cd backend
2. Install dependencies:
   npm install
3. Start the server:
   npm start

## Running the App

- For iOS: `npm run ios`
- For Android: `npm run android`
- For web: `npm run web`

## API Documentation

API documentation is available via Swagger. After starting the backend server, visit `http://localhost:5001/api-docs` to view the API documentation.

## Project Structure

frontend/
├── src/
│ ├── components/
│ ├── screens/
│ ├── navigation/
│ ├── services/
│ ├── utils/
│ └── App.tsx
├── assets/
└── package.json

backend/
├── src/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ └── server.ts
└── package.json

## Contributing

[Add contribution guidelines if this is an open-source project]

## License

[Specify the license under which this project is released]

## Contact

kazakis.th@gmail.com
