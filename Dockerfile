FROM node:22-slim 

WORKDIR /app
COPY package*.json ./
# tini as PID 1 reaps the zombie headless_shell helper processes Chromium leaves behind
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
RUN npm ci --ignore-scripts
COPY src/ ./src
COPY app.ts ./
COPY tsconfig.json ./
COPY playwright.config.ts ./
RUN npm run setup

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm","run", "start-service"]
