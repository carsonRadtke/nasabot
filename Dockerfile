# Use the latest LTS version of Node.js
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application code
COPY . .

# Install dependencies
RUN npm install

# Build the solution
RUN npx tsc

# Command to run the application
CMD ["node", "build/bot.js"]