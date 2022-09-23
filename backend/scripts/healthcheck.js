var http = require("http");

var options = {  
    host : "localhost",
    path: '/api/auth/ping',
    method: 'GET',
    port : 5000,
    timeout : 2000
};

var request = http.request(options, (res) => {  
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode == 401) {
        // in the healthcheck context this means its okay. TODO: improve
        console.log("0");
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});

request.on('error', function(err) {  
    console.log(err);
    process.exit(1);
});

request.end();  