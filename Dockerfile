# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port defined in your .env
EXPOSE 8000

# Start the Node.js server
CMD ["npm", "start"]