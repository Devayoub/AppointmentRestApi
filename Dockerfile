FROM node:12.16.1-slim
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
RUN mongod
CMD [ "npm", "test-data" ]
CMD [ "npm", "start" ]
