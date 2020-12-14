FROM node:14.14.0-alpine3.10

EXPOSE 8124

RUN mkdir /project && mkdir /project/node-app && chown node:node /project/node-app
WORKDIR /project/node-app

COPY package.json package-lock.json* ./

RUN npm install --no-optional && npm cache clean --force

COPY . .

CMD [ "npm", "run" , "start-prod" ]
