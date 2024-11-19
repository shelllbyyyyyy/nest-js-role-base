FROM node:alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm build

FROM node:alpine AS production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --prod

CMD ["node", "dist/main"]

