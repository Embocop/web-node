(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.init = function () {
    bindElementsByClass("close-popover", "click", destroyPopover);
    bindElementsByClass("delete-card", "click", deleteCard);
};

const createPopover = function (title, text) {
    const filter = document.getElementById("filter");
    filter.style.display = 'block';
    filter.style.opacity = '1.0';
    document.getElementById("popup-name").innerHTML = title;
    document.getElementById("popup-body").innerHTML = text;
}

const destroyPopover = function () {
    const filter = document.getElementById("filter");
    filter.style.opacity = '0';
    filter.style.display = 'none';
}

const deleteCard = function (e) {
    const el = e.target;
    console.log(el);
    const parent = el.findAncestorByClassName("card");
    const ancestor = parent.parentNode;
    const second = function () {
        parent.animate("height", 1, 400, "easeInCubic", () => {
            ancestor.removeChild(parent);
        });
    }
    parent.animate("opacity", 0, 500, "easeInQuartic", second);
}

const infoCard = function (el) {
    var text = el.childNodes[0].value
    var title = el.childNodes[0].className
    createPopover(title, text);
}

const editCard = function (el) {
    var parent = el;
    while (parent.className != "card") {
        parent = parent.parentNode;
    }
    var body = parent.getElementsByClassName("card-body")[0];
    var content = body.innerHTML.replaceAll("\n", "").replaceAll("<p>", "").replaceAll("</p>", "\n");
    body.innerHTML = "<textarea>" + content + "</textarea>";
    body.childNodes[0].style.height = body.childNodes[0].scrollHeight + "px";
    el.className = "fa fa-floppy-o";
    el.onclick = () => { sC(el) };
}

const saveCard = function (el) {
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

function bindElementsByClass(classname, event, callback) {
    const elements = document.getElementsByClassName(classname);
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        item.addEventListener(event, callback);
    };
}
},{}],2:[function(require,module,exports){
"use strict";

module.exports.configure = function (modules) {
    const timing = modules.timing;

    String.prototype.replaceAll = function (search, replacement) {
        const target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    HTMLElement.prototype.hasClass = function (target) {
        const classList = this.className.split(" ");
        var flag = false;
        classList.forEach((item, index) => {
            if (item == target) flag = true;
        });
        return flag;
    }

    HTMLElement.prototype.findAncestorByClassName = function (target) {
        if (this.hasClass(target)) return this;
        else {
            if (this.parentNode != null) return this.parentNode.findAncestorByClassName(target);
            else return null;
        }
    }

    HTMLElement.prototype.animate = function (property, target, duration, type, callback) {
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue(property).replace("px", ""));
        const diff = target - current;
        const inc = diff / (duration / 10);
        var unit = "";

        if (property != "opacity") {
            unit = "px";
        }

        this.style[property] = current + unit;
        timing.timedLoop((t) => {
            this.style[property] = timing[type](duration - t, current, diff, duration) + unit;
        }, duration, 10, callback);
    }

    var smoothScroll = function (anchor, duration) {
        // Calculate how far and how fast to scroll
        const resolution = 16;

        const startLocation = window.pageYOffset;
        const endLocation = module.exports.getElementCoords(anchor).top - 65;
        const distance = endLocation - startLocation;
        const increments = distance / (duration / resolution);
        var counter = 0;
        let stopAnimation;

        // Scroll the page by an increment, and check if it's time to stop
        const animateScroll = function () {
            counter += resolution
            const next = timing.easeOutCubic(counter, startLocation, distance, duration);
            window.scrollTo(0, next);
            stopAnimation();
        };

        // If scrolling down
        if (increments >= 0) {
            // Stop animation when you reach the anchor OR the bottom of the page
            stopAnimation = function () {
                const travelled = window.pageYOffset;
                if ((travelled >= (endLocation - increments)) || ((window.innerHeight + travelled) >= document.body.offsetHeight)) {
                    clearInterval(runAnimation);
                }
            };
        }
        // If scrolling up
        else {
            // Stop animation when you reach the anchor OR the top of the page
            stopAnimation = function () {
                const travelled = window.pageYOffset;
                if (travelled <= (endLocation || 0)) {
                    clearInterval(runAnimation);
                }
            };
        }

        // Loop the animation function
        const runAnimation = setInterval(animateScroll, resolution);

    };

    // Define smooth scroll links
    var scrollToggle = document.querySelectorAll('.smooth');

    // For each smooth scroll link
    [].forEach.call(scrollToggle, function (toggle) {

        // When the smooth scroll link is clicked
        toggle.addEventListener('click', function (e) {

            // Prevent the default link behavior
            e.preventDefault();

            // Get anchor link and calculate distance from the top
            var dataID = toggle.getAttribute('href');
            var dataTarget = document.querySelector(dataID);
            var dataSpeed = 1000;

            // If the anchor exists
            if (dataTarget) {
                // Scroll to the anchor
                smoothScroll(dataTarget, dataSpeed || 500);
            }

        }, false);

    });
}

module.exports.getPosition = function (element) {
    let xPosition = 0;
    let yPosition = 0;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }

    return { x: xPosition, y: yPosition };
}

module.exports.getElementCoords = function (elem) {
    var root = document.documentElement,
        body = document.body,
        sTop = window.pageYOffset || root.scrollTop || body.scrollTop,
        sLeft = window.pageXOffset || root.scrollLeft || body.scrollLeft,
        cTop = root.clientTop || body.clientTop || 0,
        cLeft = root.clientLeft || body.clientLeft || 0,
        rect = elem.getBoundingClientRect(),
        top = Math.round(rect.top + sTop - cTop),
        left = Math.round(rect.left + sLeft - cLeft);

    return {
        top: top,
        left: left
    };
}
},{}],3:[function(require,module,exports){
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
},{"./cards.js":1,"./global.js":2,"./timing.js":4}],4:[function(require,module,exports){
module.exports.easeOutCubic = function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

module.exports.easeInCubic = function (t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
};

module.exports.easeInQuartic = function (t, start, interval, duration) {
    t = t / duration;
    return interval * t * t * t * t + start;
};

module.exports.timedLoop = function (callback, duration, increment, done) {
    if (duration >= 0) {
        setTimeout(() => {
            callback(duration);
            module.exports.timedLoop(callback, duration - increment, increment, done);
        }, increment);
    }
    else {
        if (done != null) {
            done();
        }
    }
}
},{}]},{},[3]);
