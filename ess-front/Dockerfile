FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/dist ./dist

RUN pnpm install --prod

EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/ess-front/server/server.mjs"]
