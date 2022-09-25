#!/bin/bash

docker run --name rtsp-to-web \
    -v /home/bsq_coli/workspace/oto/cams:/config \
    --network host \
    ghcr.io/deepch/rtsptoweb:latest 