const http = require('http');

const data = JSON.stringify({
    username: "Test Admin",
    email: "testadmin" + Date.now() + "@test.com",
    password: "password123",
    role: "Lead Admin",
    department: "CSE",
    clubName: "Developer Club"
});

const options = {
    hostname: 'localhost',
    port: 5555,
    path: '/api/admin/create-admin',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
        // omitting auth token to see if it gives 403 or what, but we need SUPER ADMIN token
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
