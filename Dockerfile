FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm

COPY . ./

RUN npm build

EXPOSE 3000

CMD ["npm", "start"]