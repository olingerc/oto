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
# && \    usermod -a -G 10 oto

RUN mkdir /home/oto/app && chown -R oto /home/oto
WORKDIR /home/oto/app

# Copy files into contaienr
COPY Pipfile* ./
COPY velona_tasks velona_tasks
COPY worker worker
COPY server.py config.py docker-entrypoint.sh ./

RUN chown -R oto /home/oto/app


# Run app
ENTRYPOINT ["./docker-entrypoint.sh"]
