# Use the latest LTS version of Node.js
FROM node:lts

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application code
COPY . .

# Install dependencies
RUN npm install

# Build the solution
RUN npm run build

# Command to run the application
CMD ["npm", "run", "bot"]
