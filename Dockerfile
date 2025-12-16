FROM node:18-alpine

# Cài đặt dependencies cho native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN npm ci && npm rebuild bcrypt --build-from-source

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "index.js"]