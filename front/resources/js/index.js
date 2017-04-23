var list = document.getElementsByClassName('header');
var content;
var spyPosition = document.getElementById("title-footer").offsetTop;
for (var i = 0; i < list.length; i++) {
  content = list[i].innerHTML.split(" ");
  for (var j = 0; j < content.length; j++) {
    var big_font = "<span style='font-size:150%;font-weight:bold;'>" + content[j].charAt(0) + "</span>";
    content[j] = big_font + content[j].substr(1);
  }
  list[i].innerHTML = content.join(" ");
}

function createPopover(title, text) {
  var filter = document.getElementById("filter");
  filter.style.display = 'block';
  filter.style.opacity = '1.0';
  document.getElementById("popup-name").innerHTML = title;
  document.getElementById("popup-body").innerHTML = text;
}

function destroyPopover() {
  var filter = document.getElementById("filter");
  filter.style.opacity = '0';
  filter.style.display = 'none';
}

window.onscroll = function(e) {
  var currentViewPosition = document.documentElement.scrollTop ? document.documentElement.scrollTop: document.body.scrollTop;
  var different = spyPosition - currentViewPosition;
  if (different <= 0) {
    document.getElementById("title-footer").className = "stick-top";
  } else {
    document.getElementById("title-footer").className = "float-down";
  }
};

var deleteCard = function(el) {
  var parent = el;
  while (parent.className != "card") {
    parent = parent.parentNode;
  }
  var ancestor = parent.parentNode;
  ancestor.removeChild(parent);
}

var infoCard = function(el) {
  var text = el.childNodes[0].value
  var title = el.childNodes[0].className
  createPopover(title, text);
}

var editCard = function(el) {
  var parent = el;
  while (parent.className != "card") {
    parent = parent.parentNode;
  }
  var body = parent.getElementsByClassName("card-body")[0];
  var content = body.innerHTML;
  body.innerHTML = "<textarea>"+content+"</textarea>";
  body.childNodes[0].style.height = body.childNodes[0].scrollHeight + "px";
  el.className = "fa fa-floppy-o";
  //el.onclick = saveCard(el);
}

var saveCard = function(el) {
  var parent = el;
  while (parent.className != "card") {
    parent = parent.parentNode;
  }
  var body = parent.getElementsByClassName("card-body")[0];
  var content = body.innerHTML.replace("<textarea>", "");
  body.innerHTML = content
  el.className = "fa fa-pencil";
  el.onclick = editCard(el);
}
