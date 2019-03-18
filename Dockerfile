FROM node:8
COPY . .
MAINTAINER Ash Agarwal <ashutosh.nath.agarwal@ibm.com>

RUN npm install
EXPOSE 8080
CMD ["npm", "run", "serve"]
