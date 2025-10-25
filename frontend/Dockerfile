# Use a Node.js release that satisfies Angular 19's engine requirement

FROM node:20.11.1 AS build
WORKDIR /app
COPY package*.json ./

RUN npm ci --silent
COPY . .

# Allow build config override (default: docker)
ARG BUILD_CONFIG=docker
RUN npm run build -- --configuration $BUILD_CONFIG

FROM nginx:alpine

RUN rm -f /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/browser/ /usr/share/nginx/html/

EXPOSE 80
