FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --chown=node:node server ./server
COPY --chown=node:node public ./public
COPY --chown=node:node shared.js ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server/index.js"]
