FROM ubuntu:20.04

# this resolves a bug in opendjk installation on stretch slim: https://github.com/debuerreotype/docker-debian-artifacts/issues/24
RUN mkdir -p /usr/share/man/man1 
# Install from ubuntu repos
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \ 
    git \
    pipenv \
    pigz \
    python3-dev \
    curl unzip \
    nano \
    wget \
    nmap \
    ffmpeg libsm6 libxext6 firefox python3.8-venv \
    && rm -rf /var/lib/apt/lists/* && apt-get clean
    # libpq-dev is for psycopg2

# Prepare running as non-root user
RUN useradd  -ms /bin/bash oto

# Prepare ssh
RUN mkdir /home/oto/.ssh
COPY ./ssh_config /home/oto/.ssh/config
RUN chown -R oto /home/oto/.ssh && \
    chgrp -R oto /home/oto/.ssh && \
    chmod 700 /home/oto/.ssh && \
    chmod 600 /home/oto/.ssh/*

# --------------------- Running as user from here on --------------------------------------------------
USER oto

RUN mkdir /home/oto/app
WORKDIR /home/oto/app

# pipenv will use theh .venv folder automatically
COPY worker/Pipfile* ./
RUN python3 -m venv .venv && \
    /home/oto/app/.venv/bin/python3 -m pip install --upgrade pip && \
    pipenv install --ignore-pipfile --deploy

RUN /home/oto/app/.venv/bin/python3 -m pip install selenium webdriver-manager

# Prepare source folder
COPY velona_tasks velona_tasks
COPY launch_worker.py config.py worker/docker-entrypoint.sh ./

ENTRYPOINT ["./docker-entrypoint.sh"]
