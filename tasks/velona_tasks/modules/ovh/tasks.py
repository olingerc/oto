# -*- coding: utf-8 -*-
"""Summary.
"""
import requests
import json

from ... import config


def ovh_check():
    import ovh

    secrets = json.loads(config.OVH_SECRETS)

    serviceName = secrets['ovhSslGatewayService']['name']
    id = secrets['ovhSslGatewayService']['id']

    client = ovh.Client(
        endpoint='ovh-eu',
        application_key=secrets['ovhApiKey']['applicationKey'],
        application_secret=secrets['ovhApiKey']['applicationSecret'],
        consumer_key=secrets['ovhApiKey']['consumerKey'],
    )

    def get_ip():
        return client.get('/sslGateway/{}/server/{}'.format(serviceName, id))

    def set_ip(new_ip):
        # Change IP adress of ssl-gateway
        return client.put('/sslGateway/{}/server/{}'.format(serviceName, id, new_ip), 
            address=new_ip,
            port=80,
        )

    def current_ip():
        url = 'http://myexternalip.com/raw'
        r = requests.get(url)
        ip = r.text
        return ip

    current_ext_ip = current_ip()
    ovh_ip = get_ip()
    ovh_ip = ovh_ip["address"]

    # Compare ext and ovh
    result = None
    if current_ext_ip != ovh_ip:
        print("New OVH IP set:", current_ext_ip)
        result = set_ip(current_ext_ip)

    message = {
        "current_ext": current_ext_ip,
        "current_ovh": ovh_ip,
        "ovh_returned": result
    }
    
    return json.dumps(message, indent=3)
