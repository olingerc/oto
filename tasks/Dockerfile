FROM ubuntu:22.04

# Install from ubuntu repos
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \ 
    openssh-client \
    python3-dev \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* && apt-get clean
# libpq-dev is for psycopg2

RUN pip3 install pipenv

# Prepare running as non-root user
RUN useradd  -ms /bin/bash oto

# Prepare ssh
RUN mkdir /home/oto/.ssh
COPY ./ssh_config /home/oto/.ssh/config
COPY ./known_hosts  /home/oto/.ssh/known_hosts
RUN chown -R oto /home/oto/.ssh && \
    chgrp -R oto /home/oto/.ssh && \
    chmod 700 /home/oto/.ssh && \
    chmod 600 /home/oto/.ssh/*

# --------------------- Running as user from here on --------------------------------------------------
USER oto

# Install python packages
RUN mkdir /home/oto/app
WORKDIR /home/oto/app

# pipenv will use the .venv folder automatically
COPY Pipfile* ./
RUN python3 -m venv .venv && \
    /home/oto/app/.venv/bin/python3 -m pip install --upgrade pip && \
    pipenv install --ignore-pipfile --deploy

# Prepare source folder
COPY velona_tasks velona_tasks
COPY worker worker
COPY server.py config.py docker-entrypoint.sh ./

# Run app
ENTRYPOINT ["./docker-entrypoint.sh"]
