FROM node:6.3

#RUN apt-get update && apt-get install -y npm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000

ENV DEBUG=followers_activity:*
CMD ["npm", "start"]
