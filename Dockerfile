FROM node:22-slim 

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY src/ ./src
COPY app.ts ./
COPY tsconfig.json ./
COPY playwright.config.ts ./
RUN npm run setup
CMD ["npm","run", "start-service"]
