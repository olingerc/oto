FROM node:18.16-slim

# Prepare running as non-root user
RUN useradd -ms /bin/bash oto
WORKDIR /home/oto

# create working directory
RUN mkdir /home/oto/app
WORKDIR /home/oto/app

# install root dependencies
RUN npm install -g @angular/cli@^15.2.3

# Copy app
COPY docker-entrypoint.sh \
    karma.conf.js \
    package.json \
    package-lock.json \
    tsconfig.json \
    tsconfig.app.json \
    tsconfig.spec.json \
    ./
RUN chown -R oto:oto ./ && chmod +x docker-entrypoint.sh

# install app dependencies
USER oto
RUN npm install
# copy source code last to make restarts on dev faster
COPY src src
# Copy angular.json to avoid rebuilds when simply testing stuff on angular.json
COPY angular.json \
    proxy.conf.json \
    ./

ENTRYPOINT ["./docker-entrypoint.sh"]
