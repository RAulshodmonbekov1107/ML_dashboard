FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy rest of the application code
COPY . .

# Build for production
RUN npm run build

# Install server dependencies
RUN npm install express cors body-parser axios --legacy-peer-deps

# Expose port for the server
EXPOSE 3001
# Expose port for the React development server
EXPOSE 3000

# Use a shell script to start either the dev server or production server
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

# Default to production mode
CMD ["production"] 