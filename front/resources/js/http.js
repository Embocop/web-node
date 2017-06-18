module.exports.post = function (url, body, success, error) {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/' + url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 201) {
                success(JSON.parse(request.responseText));
            } else {
                error(request);
            }
        }
    }
    request.send(JSON.stringify(body));
};

module.exports.get = function (url, body, success, error) {
    const request = new XMLHttpRequest(),
        params = Object.keys(body).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
        }).join('&');
    request.open('GET', '/api/' + url + "?" + params);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 204) {
                success(JSON.parse(request.responseText));
            } else {
                error(request);
            }
        }
    }
    request.send();
}

module.exports.delete_cookie = function (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/;';
};