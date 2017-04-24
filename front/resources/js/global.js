String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }

    return { x: xPosition, y: yPosition };
}

function post(url, body, success, error) {
  var request = new XMLHttpRequest();
  request.open('POST', '/api/' + url);
  request.setRequestHeader('Content-Type', 'application/json');
  request.onreadystatechange = function() {
    if(request.readyState === 4) {
      if(request.status === 200) {
        success(JSON.parse(request.responseText));
      } else {
        error(request);
      }
    }
  }
  request.send(JSON.stringify(body));
}
