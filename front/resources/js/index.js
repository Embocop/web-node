const timing = require("./timing.js");
const globals = require("./global.js");
const cards = require("./cards.js");

globals.configure({ timing: timing });
cards.init();

window.onload = function () {
    remember = window.scrollTop;
    window.scrollTo(0, 0);
    bondPosition = globals.getPosition(document.getElementById("nav")).y;
    window.scrollTo(0, remember);
    window.onscroll = function (e) {
        var currentViewPosition = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
        var different_one = spyPosition - currentViewPosition;
        //var toolbar = document.getElementById("nav");
        //var different_two = bondPosition - currentViewPosition;
        if (different_one <= 0) {
            document.getElementById("title-footer").className = "stick-top";
        } else {
            document.getElementById("title-footer").className = "float-down";
        }
        /*
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
        */
    };
    //filterClick(document.getElementById("nav").childNodes[0], "Problem");
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

var addSubscriber = function() {
  var email_form = document.getElementById("email");
  var email = email_form.value;

  function showMessage (type, text) {
    var message = document.getElementById(type);
    message.innerHTML = text;
    message.style.display = "block";
    setTimeout(()=> {message.style.display = "none";}, 2000);
  }

  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(!re.test(email)) {
    showMessage("error", "Please provide a valid email address");
  } else {
    post("add_subscriber", {email: email}, (data) => {showMessage("good", "Thank you!  You should receive an email confirmation shortly.");}, (err) => {console.error(err);});
  }
}


const filterClick = function (el, cat) {
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