function post(url, body, success, error) {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/' + url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                success(JSON.parse(request.responseText));
            } else {
                error(request);
            }
        }
    }
    request.send(JSON.stringify(body));
}