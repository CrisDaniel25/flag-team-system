# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i --legacy-peer-deps
COPY . .
ARG API_URL=""
ENV NG_APP_API_URL=$API_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/flag-team-web/browser /usr/share/nginx/html
RUN echo "window.__API_URL__='${NG_APP_API_URL}';" > /usr/share/nginx/html/env.js
EXPOSE 80
