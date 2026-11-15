FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node index.html app.js server.js ./

EXPOSE 4173
USER node

CMD ["node", "server.js"]
