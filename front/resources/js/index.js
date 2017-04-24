window.onload = function() {
  remember = window.scrollTop;
  window.scrollTo(0, 0);
  bondPosition = getPosition(document.getElementById("nav")).y;
  window.scrollTo(0, remember);
  window.onscroll = function(e) {
    var currentViewPosition = document.documentElement.scrollTop ? document.documentElement.scrollTop: document.body.scrollTop;
    var different_one = spyPosition - currentViewPosition;
    var toolbar = document.getElementById("nav");
    var different_two = bondPosition - currentViewPosition;
    if (different_one <= 0) {
      document.getElementById("title-footer").className = "stick-top";
    } else {
      document.getElementById("title-footer").className = "float-down";
    }
    if (different_two <= 0) {
      toolbar.className = "glued";
      toolbar.style.borderRight = "none";
      toolbar.style.top = document.getElementById("title-footer").offsetHeight + "px";
      document.getElementById("placeholder").style.height = (toolbar.offsetHeight * 2) + "px";
    } else {
      toolbar.className = "relative";
      toolbar.style.borderRight = "3px solid #CCC";
      toolbar.style.top = "0";
      document.getElementById("placeholder").style.height = "0";
    }
  };
  filterClick(document.getElementById("nav").childNodes[0], "Problem");
}
var list = document.getElementsByClassName('header');
var content;
var spyPosition = document.getElementById("title-footer").offsetTop;
var bondPosition = 0;
var active = "";

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

var deleteCard = function(el) {
  var parent = el;
  while (parent.className != "card") {
    parent = parent.parentNode;
  }
  var ancestor = parent.parentNode;
  ancestor.removeChild(parent);
}

var filterClick = function(el, cat) {
  var current = document.getElementsByClassName("active")[0];
  if (current != null) {
    current.className = current.className.replace("active ", "");
  }
  var q = document.getElementsByClassName(active);
  for (var i = 0; i < q.length; i++) {
    q[i].style.display = "none";
  }

  var p = document.getElementsByClassName(cat);
  for (var i = 0; i < p.length; i++) {
    p[i].style.display = "block";
  }
  active = cat;
  el.className = "active " + el.className;
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
  var content = body.innerHTML.replaceAll("\n", "").replaceAll("<p>", "").replaceAll("</p>", "\n");
  body.innerHTML = "<textarea>"+content+"</textarea>";
  body.childNodes[0].style.height = body.childNodes[0].scrollHeight + "px";
  el.className = "fa fa-floppy-o";
  el.onclick = () => { sC(el) };
}

function sC(el) {
  var parent = el;
  while (parent.className != "card") {
    parent = parent.parentNode;
  }
  var body = parent.getElementsByClassName("card-body")[0];
  var content = "<p>" + body.childNodes[0].value.replaceAll("\n", "</p><p>");
  content = content.substring(0, content.length - 3);
  body.innerHTML = content
  el.className = "fa fa-pencil";
  el.onclick = () => { editCard(el) };
}
