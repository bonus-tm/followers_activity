FROM node:6.3

RUN apt-get update && apt-get install -y npm

EXPOSE 3000
WORKDIR /usr/src/app
#CMD DEBUG=followers_activity:* npm start
CMD ["node", "./bin/www"]
