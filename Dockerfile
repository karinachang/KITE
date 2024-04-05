FROM node:alpine

WORKDIR /app

COPY package.json ./

RUN npm install
EXPOSE 8080

COPY ./Backend/server.js /app/Backend/server.js

CMD ["npm", "run", "start"]