# Use Node.js as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
# Utilize Docker's caching layer to save time during subsequent builds
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the application
RUN npm run build

# Expose the application port (3000 in the container)
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]