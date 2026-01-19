### builder
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-dev AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

### runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8080
CMD ["index.js"]