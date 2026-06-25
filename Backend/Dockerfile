# Use the official Puppeteer image which includes Chromium and all required dependencies
FROM ghcr.io/puppeteer/puppeteer:22.0.0

# Switch to root to configure directory permissions if needed, though Workdir can do it
WORKDIR /app

# Copy package.json and package-lock.json
COPY --chown=pptruser:pptruser package*.json ./

# Tell Puppeteer to skip downloading Chromium during npm install (since it is pre-installed in this image)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PORT=3000

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY --chown=pptruser:pptruser . .

# Expose the API port
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
