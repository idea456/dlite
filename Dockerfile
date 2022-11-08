from node:latest as build
workdir /app
copy . .
run npm install
run npm run build

from nginx:stable-alpine
copy --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
expose 80
entrypoint ["nginx", "-g", "daemon off;"]
