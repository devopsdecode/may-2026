# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install application dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose container port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run application
CMD ["npm", "start"]
