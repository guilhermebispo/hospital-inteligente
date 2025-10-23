FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .

RUN npm run build -- --configuration docker

FROM nginx:alpine

RUN rm -f /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html/

EXPOSE 80
