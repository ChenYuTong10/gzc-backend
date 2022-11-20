FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 9090

ENTRYPOINT ["npm", "run", "start"]

# sudo docker build . -t gzc-backend
# sudo docker run -d -v /home/ecs-user/gzc-backend/logs:/app/logs -p 9090:9090 gzc-backend
