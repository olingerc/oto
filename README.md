# oto
Organize the Olingers App

# Frontend

https://angular.io/tutorial/toh-pt0

# Ideas

https://pyimagesearch.com/2020/09/21/opencv-automatic-license-number-plate-recognition-anpr-with-python/

# Workers

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

