# oto
Organize the Olingers App

# Frontend

https://angular.io/tutorial/toh-pt0

# Ideas
https://pyimagesearch.com/2020/09/21/opencv-automatic-license-number-plate-recognition-anpr-with-python/

# Workers

# On pi
- Installed docker, git

```
cd /home/chris/oto/app/oto && git pull && docker compose -f docker-compose.startprod.yml up --build -d
```

Ubuntu 22.04 python

I was getting the same error on ubuntu 22.04, This is how I solved it.
remove pipenv if you have installed it using apt
sudo apt remove pipenv
install pipenv unsing pip
 pip3 install pipenv
activate virtual environment
python3 -m pipenv shell
install from pipfile
pipenv install

