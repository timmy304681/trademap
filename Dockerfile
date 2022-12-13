FROM node:16.16.0
WORKDIR /trademap
COPY ./package.json /trademap 
RUN npm install
COPY . /trademap 


EXPOSE 3000
CMD [ "node", "app.js" ]