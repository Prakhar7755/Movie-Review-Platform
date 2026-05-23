# Stage 1: Build the React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Express server
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy server dependencies and install only production packages
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy the built client from Stage 1 into the location the server expects
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 5001

WORKDIR /app/server
CMD ["node", "app.js"]