FROM node:14-bullseye as base
LABEL org.opencontainers.image.authors=dragos.jarca@dynamicpuzzle.ro
LABEL org.opencontainers.image.title="SonicJs Dockerfile"
LABEL org.opencontainers.image.licenses=MIT
LABEL com.sonicjs.nodeversion=$NODE_VERSION
ENV NODE_ENV=dev
RUN apt-get update -qq && apt-get install -qy \ 
    openssh-client \
    git \
    python \
    curl \
    libfontconfig \
    --no-install-recommends
EXPOSE 3018
ENV PORT 3018
WORKDIR /app
COPY package*.json ./
RUN npm config list
#RUN npm install
RUN npm ci && npm cache clean --force
ENV PATH /app/node_modules/.bin:/app:$PATH
COPY ./ /app
#ENV TINI_VERSION v0.18.0
#ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
#RUN chmod +x /tini
#ENTRYPOINT ["/tini", "--"]
RUN chown -R node:node ./
USER node
CMD ["npm", "start"]
