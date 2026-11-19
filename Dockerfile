FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node src/ ./src/
RUN mkdir -p /app/.data && chown node:node /app/.data
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 DATA_DIR=/app/.data BEHIND_HTTPS_PROXY=true
EXPOSE 4173
CMD ["node", "scripts/server.mjs"]
