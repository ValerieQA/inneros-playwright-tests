# Official image: Ubuntu 24.04 + Chromium, Firefox, WebKit and their system dependencies.
# Its version must match @playwright/test in package.json.
FROM mcr.microsoft.com/playwright:v1.65.0-noble
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test", "--update-snapshots=missing"]
