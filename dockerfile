# Stage 1: Set up the backend
FROM node:18 AS backend-build

WORKDIR /app/backend

# Copy backend package.json and package-lock.json
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY backend ./

# Compile TypeScript to JavaScript
RUN npx tsc

# Stage 2: Create the final image
FROM node:18

WORKDIR /app

# Copy frontend files
COPY frontend ./frontend

# Install Expo CLI globally
RUN npm install -g expo-cli

# Install frontend dependencies
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy backend files
WORKDIR /app/backend
COPY --from=backend-build /app/backend ./

# Install production dependencies for backend
RUN npm install --only=production

# Expose the port your app runs on
EXPOSE 5001

# Set the working directory back to the root
WORKDIR /app

# Command to run the backend
CMD ["node", "backend/dist/server.js"]