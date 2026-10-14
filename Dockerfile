FROM nginx:alpine
COPY index.html style.css app.js spell-fx.js /usr/share/nginx/html/
EXPOSE 80
