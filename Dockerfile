FROM navikt/node-express:16

ENV CI=true

COPY package.json .
RUN yarn install --unsafe-perm --no-update-notifier --no-fund

WORKDIR /app

RUN yarn add dotenv
RUN yarn add axios
RUN yarn add cors

EXPOSE 8080

COPY index.js /app/
COPY /config/. /app/config/.

CMD ["node", "/app/index.js"]