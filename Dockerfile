# ---------- Base Stage ----------
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- Development Stage ----------
FROM base AS development
ENV NODE_ENV=development
RUN npm install
# COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- Build Stage ----------
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# ---------- Production Stage ----------
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.js ./
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]