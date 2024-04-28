FROM node:latest

WORKDIR /cli-folder-organiser

COPY package*.json tsconfig.json ./
COPY config-files ./config-files
COPY src ./src

RUN npm install

CMD ["npm", "run", "start"]
