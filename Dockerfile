FROM node:lts-alpine

WORKDIR /bot
COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "bot"]

