FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy site files
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]