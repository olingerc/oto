FROM node:16.15-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Prepare running as non-root user
RUN useradd -ms /bin/bash oto
WORKDIR /home/oto

# create working directory
RUN mkdir /home/oto/app
WORKDIR /home/oto/app

# install root dependencies
RUN npm install -g @angular/cli@^14.2.3

# Copy app
COPY docker-entrypoint.sh \
    karma.conf.js \
    package.json \
    package-lock.json \
    tsconfig.json \
    tsconfig.app.json \
    tsconfig.spec.json \
    .browserslistrc \
    #proxy.conf.json \
    ./
RUN chown -R oto:oto ./ && chmod +x docker-entrypoint.sh

# install app dependencies
USER oto
RUN npm install
# copy source code last to make restarts on dev faster
COPY src src
# Copy angular.json to avoid rebuilds when simply testing stuff on angular.json
COPY angular.json \
    ./
#######ENV NODE_OPTIONS="--max_old_space_size=16384"

ENTRYPOINT ["./docker-entrypoint.sh"]
