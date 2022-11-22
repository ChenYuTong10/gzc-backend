FROM node:16-alpine

WORKDIR /app

COPY . .

# set registry in china
RUN npm config set registry https://registry.npm.taobao.org

RUN npm install && npm run build

EXPOSE 9090

ENTRYPOINT ["npm", "run", "start"]

# docker build . -t gzc-backend
# docker run \
# --name corpusbackend \
# --network cms \
# -v $HOME/gzc-backend/logs:/app/logs \
# -p 9090:9090 -d chenyutong996/gzc-backend
