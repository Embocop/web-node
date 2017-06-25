"use strict";

module.exports.configure = function (modules) {
    const timing = modules.timing;

    Array.prototype.inArray = function (needle) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === needle) {
                return true;
            }
        }
        return false;
    };

    String.prototype.replaceAll = function (search, replacement) {
        const target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    String.prototype.toTitleCase = function ()
    {
        return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    HTMLElement.prototype.getChildByClass = function (classname) {
        let output = [];
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].className != null && this.childNodes[i].className.includes(classname)) {
                let names = this.childNodes[i].className.split(" ");
                for (let j = 0; j < names.length; j++) {
                    if (names[j] == classname) output.push(this.childNodes[i]); 
                }
            }
        }
        return output;
    }

    HTMLElement.prototype.removeAllChildren = function () {
        while (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }
    }

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
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue(property).replace("px", "")),
            diff = target - current,
            inc = diff / (duration / 10);
        var unit = "";

        if (property.includes("-")) {
            property = property.split("-")[0] + property.split("-")[1].capitalize();
        }
        
        if (property != "opacity") {
            unit = "px";
        }

        this.style[property] = current + unit;
        timing.timedLoop((t) => {
            this.style[property] = timing[type](duration - t, current, diff, duration) + unit;
        }, duration, 10, callback);
    }

    HTMLElement.prototype.fadeOut = function (duration, callback, remove) {
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue("opacity")),
            diff = 0 - current,
            inc = diff / (duration / 10);

        this.style.opacity = current;
        timing.timedLoop((t) => {
            this.style.opacity = timing.easeInQuartic(duration - t, current, diff, duration);
        }, duration, 10, () => {
            if (remove != false) {
                this.style.display = "none";
            }
            callback();
        });
    }

    HTMLElement.prototype.fadeIn = function (duration, callback) {
        this.style.display = "initial";
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue("opacity"));
        const diff = 1 - current;
        const inc = diff / (duration / 10);

        this.style.opacity = current;
        timing.timedLoop((t) => {
            this.style.opacity = timing.easeInQuartic(duration - t, current, diff, duration);
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


module.exports.formatDate = function(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return monthNames[monthIndex] + ' ' + day + ', ' + year + '&nbsp;&nbsp;' + date.getHours() + ":" + date.getMinutes();
}

module.exports.currentDateTime = function () {
    return module.exports.formatDate(new Date());  // show current date-time in console
}