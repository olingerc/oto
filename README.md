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


- The Pi has a webserver at port 80, I use OVH ssl service to accept ssl connections, but that one then forwards to my port 80
- My fritz should forward all port 80 connections to the pi

# On pi

Prepare network mount in /etc/fstab
`//192.168.178.111/surveillance  /mnt/surveillance  cifs  username=pi,password=H34n3VTKZYjzdfseCYMt,iocharset=utf8  0  0`
check 1password for password

## Install
- On pi install docker, git
- Clone into /home/chirs/oto/app
- Create secrets in /home/chirs/oto/app/oto/secrets/passwords (cf docker-compose.startprod.yml for hich are needed. Just invent passowrds)
- For OVH and CAM, check in 1password, for PRUSA check in printer
- Get id_rsa_dev from iPassword and put into /home/chirs/oto/app/oto/secrets/certificates

```
cd /home/chris/oto/app/oto && git pull && docker compose -f docker-compose.startprod.yml up --build -d
```

Ubuntu 22.04 python

I was getting the same error on ubuntu 22.04, This is how I solved it.
- remove pipenv if you have installed it using apt
- sudo apt remove pipenv
- install pipenv unsing pip
  - pip3 install pipenv
- activate virtual environment
- python3 -m pipenv shell
- install from pipfile
- pipenv install

