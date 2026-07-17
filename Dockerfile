### builder
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-dev AS builder
USER root
RUN apk update && apk add --no-cache pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME" && chown -R node:node "$PNPM_HOME"
USER node
WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=65532 \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .

### runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8080
CMD ["index.js"]