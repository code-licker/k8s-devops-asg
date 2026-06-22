FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG ANIME_API_URL
ENV ANIME_API_URL=$ANIME_API_URL

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5002

CMD ["nginx", "-g", "daemon off;"]
