# oto
Organize the Olingers App

# Frontend

https://angular.io/tutorial/toh-pt0

# Ideas

https://pyimagesearch.com/2020/09/21/opencv-automatic-license-number-plate-recognition-anpr-with-python/

# Workers

# Prepare connection

## Prepare outside part
- My fritz should forward all port 80 connections to the pi. For this configure HTTP-Server. This will use port 80 automatically. No need to forwartd https
- To test, start a webserver on port 8- on pi `docker run -it --rm -p 80:80 nginx`
- Got to `http://192.168.178.45/`
- Configure OVH to go to your ip adress on port 80 (servers tab), in domains tab configure www.olinger.eu and olinger.eu
- Go To `https://www.olinger.eu/`: it should work
- Go To `http://www.olinger.eu/`: it should work as well

## How does the oto frontend handle connections


- The Pi has a webserver at port 8080 (docker exposes inside 80 to outside 8080), I use OVH ssl service to accept ssl connections, but that one then forwards to my port 80
- My fritz should forward all incoming port 80 to internal port 8080 connections to the pi

So:
- a2hosting www.olinger.eu to ovh ssl gateway (via ip adress)
- ovh ssl gateway to 80 on post IP (updated by oto job and OVH API)
- Post IP to my fritz
- fritz listens externally to 80 and sends to kitchenpi port **8080**
- kitchenpi **8080** as docker frontend which internally gives it to 80
- Internally my docker frontend
  - listens at 80. If via olinger.eu then rewrites to https on 443
  - listens at 80 if not olinger.eu, continues

- So to acces at home I need to use IP and port **8080**

# Development:
## Preparing tasks

- install dependencies: `sudo apt install pipenv libpq-dev` (libpq-dev is fro psycopg2)
- change into tasks folder
- prepare a venv folder for pipenv: `python3 -m venv .venv`
- install python deps: `pipenv install --dev`. pipenv will automatically take the .venv folder
- remember to redo pipenv install to update Pipfile.lock each time you change a dependency
- use `pipenv shell` if you ever need to activate the virtual environment

## Preparing worker

- change into tasks/worker folder
- prepare a venv folder for pipenv: `python3 -m venv .venv`
- prepare empty Pipfile: `touch Pipfile`. otherwise pipenv will take the Pipfile from tasks
- install python deps: `pipenv install`. pipenv will automatically take the .venv folder
- remember to redo pipenv install to update Pipfile.lock each time you change a dependency

## Start up
- docker compose -f docker-compose.dev.yaml build
- docker compose -f docker-compose.dev.yaml up

# Production (currently ugreen)
- use docker app on UGREEN
- login via ssh, git pull in a folder accessible to docker a[[]]
- create postgres folder
- Create secrets in /home/chirs/oto/app/oto/secrets/passwords (cf docker-compose.startprod.yml for hich are needed. Just invent passowrds)
- For OVH check in 1password
- start the app using the docker-compose.yaml
- Create tables in postgres



- create database tables as indicated in install/database.sql (be sure to seclect database `oto`)
- `cd /home/chris/oto/app/oto && git pull && docker compose -f docker-compose.startprod.yml down`
- `cd /home/chris/oto/app/oto && git pull && docker compose -f docker-compose.startprod.yml up --build -d`
- at this point oto will create an admin/123 user automatically
