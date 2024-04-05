FROM node:alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY ./Backend/server.js /app/Backend/server.js

# CMD ["npm", "run", "start"]