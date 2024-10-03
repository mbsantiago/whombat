FROM node:lts

ENV CI=true
ENV PORT=3000

WORKDIR /code

COPY package.json /code/package.json

COPY package-lock.json /code/package-lock.json

RUN npm ci

COPY . /code

CMD [ "npm", "run", "dev" ]
