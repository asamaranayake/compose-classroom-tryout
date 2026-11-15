FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node app.js ./

ENV PORT=3000
EXPOSE 3000
USER node

CMD ["node", "app.js"]
