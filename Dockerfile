# syntax=docker/dockerfile:1
# Image du client web Delibera : la même en local (compose.yaml) et en production
# (deploy/compose.prod.yaml sur l'EC2). Construite et testée par GitHub Actions.
#   docker build --build-arg DELIBERA_VERSION=$(git rev-parse --short=12 HEAD) -t delibera-frontoffice .
#
# Le chemin /app (basePath) est fixé à la construction : DELIBERA_BASE_PATH le change.

ARG NODE_VERSION=24

# --- 1. Dépendances (couche réutilisée tant que pnpm-lock.yaml ne change pas)
FROM node:${NODE_VERSION}-alpine AS dependances
WORKDIR /construction
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- 2. Construction : serveur autonome Next.js (.next/standalone)
FROM node:${NODE_VERSION}-alpine AS construction
WORKDIR /construction
RUN corepack enable
ARG DELIBERA_VERSION=dev
ARG DELIBERA_BASE_PATH=/app
ENV DELIBERA_VERSION=${DELIBERA_VERSION} \
    DELIBERA_BASE_PATH=${DELIBERA_BASE_PATH} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=dependances /construction/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- 3. Exécution : Node seul, utilisateur sans privilèges, aucune dépendance de construction
FROM node:${NODE_VERSION}-alpine
ARG DELIBERA_BASE_PATH=/app
RUN addgroup -S -g 10001 delibera && adduser -S -u 10001 -G delibera -H -s /sbin/nologin delibera
WORKDIR /application
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=UTC \
    DELIBERA_SONDE=${DELIBERA_BASE_PATH}/sante
COPY --from=construction --chown=delibera:delibera /construction/.next/standalone ./
COPY --from=construction --chown=delibera:delibera /construction/.next/static ./.next/static
COPY --from=construction --chown=delibera:delibera /construction/public ./public
USER delibera
EXPOSE 3000
# La sonde ne dépend pas de l'API : le client web reste « en bonne santé » si l'API redémarre.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=4 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+process.env.DELIBERA_SONDE).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server.js"]
