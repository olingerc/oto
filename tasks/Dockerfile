FROM ubuntu:24.04
# It has UID 1000 and I need taht for UGREEN
RUN userdel -r ubuntu

# Install from ubuntu repos
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    python3-venv \
    python3-pip \
    libpq-dev \
    tzdata \
    && rm -rf /var/lib/apt/lists/* && apt-get clean

# Prepare running as non-root user
RUN useradd  -ms /bin/bash --uid 1000 oto

# Copy files into contaienr
COPY --chown=oto:oto Pipfile* ./
COPY --chown=oto:oto velona_tasks velona_tasks
COPY --chown=oto:oto worker worker
COPY --chown=oto:oto server.py config.py docker-entrypoint.sh ./

# --------------------- Running as user from here on --------------------------------------------------
USER oto

RUN mkdir /home/oto/app
WORKDIR /home/oto/app

# pipenv will use the .venv folder automatically
RUN python3 -m venv .venv
RUN /home/oto/app/.venv/bin/pip3 install pipenv 
RUN /home/oto/app/.venv/bin/pipenv install --ignore-pipfile --deploy

# Run app
ENTRYPOINT ["./docker-entrypoint.sh"]
