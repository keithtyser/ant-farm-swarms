# frontend/Dockerfile
# ───────────────────
# stage 1 – build the Vite app
FROM node:lts-alpine AS build
WORKDIR /app

# copy sources that NPM needs first (enable layer‑cache)
COPY package*.json ./
RUN npm ci --ignore-scripts

# copy the rest of the frontend sources & build
COPY . .
RUN npm run build                 # ➜ dist/

# stage 2 – tiny nginx image to serve the static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
