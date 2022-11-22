FROM node:16-alpine

WORKDIR /app

COPY . .

# set registry in china
RUN npm config set registry https://registry.npm.taobao.org && npm install

EXPOSE 9090

ENTRYPOINT ["npm", "run", "start"]

# sudo docker build . -t gzc-backend
# sudo docker run -d -v /home/ecs-user/gzc-backend/logs:/app/logs -p 9090:9090 gzc-backend
