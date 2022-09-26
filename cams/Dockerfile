FROM node:16.15-slim

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /home/oto/app/node_modules/.bin:$PATH

# get ubuntu dependencies necessary for npm install
# RUN apt-get install libkrb5-dev (already in node image)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Prepare running as non-root user
RUN mkdir /srv/stream
WORKDIR /srv/stream

# copy assets
COPY docker-entrypoint.sh package.json package-lock.json ./
RUN npm install

COPY stream.ts index.html ./

ENTRYPOINT ["./docker-entrypoint.sh"]
