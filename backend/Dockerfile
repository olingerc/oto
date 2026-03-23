FROM node:20.17-slim

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /home/oto/app/node_modules/.bin:$PATH

# get ubuntu dependencies necessary for npm install
# RUN apt-get install libkrb5-dev (already in node image)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# GLOBAL
RUN npm install -g typescript@4.1.3 ts-node-dev knex@2.3.0

# node image already has a user with id 1000
RUN groupmod -g 1001 node && usermod -u 1001 -g 1001 node 
# Prepare running as non-root user
RUN useradd -ms /bin/bash oto --uid 1000 && mkdir /home/oto/app
WORKDIR /home/oto/app

# copy assets
COPY docker-entrypoint.sh package.json package-lock.json tsconfig.json tslint.json ./
COPY src src
COPY scripts/healthcheck.js /home/oto/app

# Change permissions
RUN chown -R oto:oto ./ && chmod +x docker-entrypoint.sh

# Run as user from here ------------

USER oto

# install dependencies
RUN npm install

ENTRYPOINT ["./docker-entrypoint.sh"]
