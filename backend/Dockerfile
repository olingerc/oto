FROM node:16.15-slim

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /home/oto/app/node_modules/.bin:$PATH

# get ubuntu dependencies necessary for npm install
# RUN apt-get install libkrb5-dev (already in node image)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    python \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript@4.1.3 ts-node-dev 

# Prepare running as non-root user
RUN useradd -ms /bin/bash oto && mkdir /home/oto/app
WORKDIR /home/oto/app

# copy assets
COPY docker-entrypoint.sh package.json package-lock.json tsconfig.json tslint.json ./

# Change permissions
RUN chown -R oto:oto ./ && chmod +x docker-entrypoint.sh

# install dependencies
USER oto
RUN npm install

# Copy actual code last, to make rebuilding faster
COPY src src
COPY scripts/healthcheck.js /home/oto/app


ENTRYPOINT ["./docker-entrypoint.sh"]
