FROM ubuntu:24.04
# It has UID 1000 and I need taht for UGREEN
RUN userdel -r ubuntu

# this resolves a bug in opendjk installation on stretch slim: https://github.com/debuerreotype/docker-debian-artifacts/issues/24
RUN mkdir -p /usr/share/man/man1 
# Install from ubuntu repos
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \ 
    git \
    pigz \
    python3-dev \
    python3-venv \
    python3-pip \
    libpq-dev \
    curl unzip \
    nano \
    wget \
    tzdata \
    && rm -rf /var/lib/apt/lists/* && apt-get clean
    # libpq-dev is for psycopg2


RUN useradd  -ms /bin/bash --uid 1000 oto

ENV Selenium_UseHeadlessDriver=true

RUN mkdir /home/oto/app
WORKDIR /home/oto/app

COPY worker/Pipfile* ./
COPY velona_tasks velona_tasks
COPY launch_worker.py config.py worker/docker-entrypoint.sh ./

# --------------------- Running as user from here on --------------------------------------------------
USER oto
# pipenv will use the .venv folder automatically
RUN python3 -m venv .venv
RUN /home/oto/app/.venv/bin/pip3 install pipenv 
RUN /home/oto/app/.venv/bin/pipenv install --ignore-pipfile --deploy


ENTRYPOINT ["./docker-entrypoint.sh"]
