/*!
 * Dashcore - HTML Startup Template, v1.1.8
 * Stripe menu.
 * Copyright © 2019 5Studios.net
 * https://5studios.net
 */

"use strict";

(function($, global, $scope) {
    $scope.Util = {
        queryArray: function(e, p) {
            p || (p = document.body);

            return Array.prototype.slice.call(p.querySelectorAll(e));
        },
        touch: {
            isSupported: "ontouchstart" in global || navigator.maxTouchPoints,
            isDragging: false
        }
    };

    $scope.menu = document.querySelector(".st-nav");

    function StripeMenu(menuElement) {
        var menu = this;

        /**
         * Main events used to enable interaction with menu
         **/
        var events = global.PointerEvent ? {
            end: "pointerup",
            enter: "pointerenter",
            leave: "pointerleave"
        } : {
            end: "touchend",
            enter: "mouseenter",
            leave: "mouseleave"
        };
        
        /**
         * The main navigation element.
         **/
        this.container = menuElement; // document.querySelector(menuElement);
        this.container.classList.add("no-dropdown-transition");

        /**
         * Element holding the menu options, not the dropdown
         **/
        this.root = this.container.querySelector(".st-nav-menu");

        /**
         * Those elements used to show the dropdown animation and transitioning
         **/
        this.dropdownBackground = this.container.querySelector(".st-dropdown-bg");
        this.dropdownBackgroundAlt = this.container.querySelector(".st-alt-bg");
        this.dropdownContainer = this.container.querySelector(".st-dropdown-container");
        this.dropdownArrow = this.container.querySelector(".st-dropdown-arrow");

        /**
         * Elements which will have the dropdown content to be shown
         **/
        this.hasDropdownLinks = $scope.Util.queryArray(".st-has-dropdown", this.root);

        /**
         * Each dropdown section to be displayed on mouse interactions
         **/
        this.dropdownSections = $scope.Util.queryArray(".st-dropdown-section", this.container).map(function(el) {
            return {
                el: el,
                name: el.getAttribute("data-dropdown"),
                content: el.querySelector(".st-dropdown-content"),
                width: el.querySelector(".st-dropdown-content").offsetWidth
            }
        });

        /**
         * Menu link interaction
         **/
        this.hasDropdownLinks.forEach(function(el) {
            el.addEventListener(events.enter, function(evt) {
                if (evt.pointerType === "touch") return;
                menu.stopCloseTimeout();
                menu.openDropdown(el);
            });

            el.addEventListener(events.leave, function(evt) {
                if (evt.pointerType === "touch") return;
                menu.startCloseTimeout();
            });

            el.addEventListener(events.end, function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                menu.toggleDropdown(el);
            });
        });

        /**
         * Menu container interaction with content
         **/
        this.dropdownContainer.addEventListener(events.enter, function(evt) {
            if (evt.pointerType === "touch") return;
            menu.stopCloseTimeout();
        });

        this.dropdownContainer.addEventListener(events.leave, function(evt) {
            if (evt.pointerType === "touch") return;
            menu.startCloseTimeout();
        });

        this.dropdownContainer.addEventListener(events.end, function(evt) {
            evt.stopPropagation();
        });

        document.body.addEventListener(events.end, function(e) {
            $scope.Util.touch.isDragging || menu.closeDropdown();
        });
    }

    function StripeMenuPopup(element) {
        var popupMenu = this;
        var eventTrigger = $scope.Util.touch.isSupported ? "touchend" : "click";
        
        this.root = document.querySelector(element);
        this.activeClass = "st-popup-active";
        this.link = this.root.querySelector(".st-root-link");
        this.popup = this.root.querySelector(".st-popup");
        this.closeButton = this.root.querySelector(".st-popup-close-button");

        this.link.addEventListener(eventTrigger, function(evt) {
            evt.stopPropagation();
            popupMenu.togglePopup();
        });

        this.popup.addEventListener(eventTrigger, function(evt) {
            evt.stopPropagation()
        });

        this.closeButton && this.closeButton.addEventListener(eventTrigger, function(evt) {
            popupMenu.closeAllPopups()
        });

        document.body.addEventListener(eventTrigger, function(evt) {
            $scope.Util.touch.isDragging || popupMenu.closeAllPopups();
        }, false);
    }

    StripeMenu.prototype.openDropdown = function(hasDropDownLink) {
        var stripeMenu = this;
        if (this.activeDropdown === hasDropDownLink) return;

        this.activeDropdown = hasDropDownLink;

        this.container.classList.add("overlay-active");
        this.container.classList.add("dropdown-active");

        /**
         * Setting the default menu active equals to this link
         **/
        this.hasDropdownLinks.forEach(function(link) {
            link.classList.remove("active")
        });
        hasDropDownLink.classList.add("active");

        /**
         * Next section to show
         **/
        var nextSection = hasDropDownLink.getAttribute("data-dropdown"),
            position = "left";

        var dropdown = {
            width: 0,
            height: 0,
            content: null
        };

        this.dropdownSections.forEach(function(dropDownSection) {
            dropDownSection.el.classList.remove("active");
            dropDownSection.el.classList.remove("left");
            dropDownSection.el.classList.remove("right");

            if (dropDownSection.name === nextSection) {
                dropDownSection.el.classList.add("active");
                position = "right";

                dropdown = {
                    width: dropDownSection.content.offsetWidth,
                    height: dropDownSection.content.offsetHeight,
                    content: dropDownSection.content
                }
            } else {
                dropDownSection.el.classList.add(position);
            }
        });

        var u = 520,
            a = 400,
            scaleX = dropdown.width / u,
            scaleY = dropdown.height / a,
            ddCr = hasDropDownLink.getBoundingClientRect(),
            translateX = ddCr.left + ddCr.width / 2 - dropdown.width / 2;

        translateX = Math.round(Math.max(translateX, 10));

        clearTimeout(this.disableTransitionTimeout);
        this.enableTransitionTimeout = setTimeout(function() {
            stripeMenu.container.classList.remove("no-dropdown-transition")
        }, 50);

        this.dropdownBackground.style.transform = "translateX(" + translateX + "px) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
        this.dropdownContainer.style.transform = "translateX(" + translateX + "px)";

        this.dropdownContainer.style.width = dropdown.width + "px";
        this.dropdownContainer.style.height = dropdown.height + "px";

        var arrowPosX = Math.round(ddCr.left + ddCr.width / 2);
        this.dropdownArrow.style.transform = "translateX(" + arrowPosX + "px) rotate(45deg)";

        var d = dropdown.content.children[0].offsetHeight / scaleY;
        this.dropdownBackgroundAlt.style.transform = "translateY(" + d + "px)"
    };

    StripeMenu.prototype.closeDropdown = function() {
        var stripeMenu = this;
        if (!this.activeDropdown) return;

        this.hasDropdownLinks.forEach(function(link, t) {
            link.classList.remove("active")
        });

        clearTimeout(this.enableTransitionTimeout);

        this.disableTransitionTimeout = setTimeout(function() {
            stripeMenu.container.classList.add("no-dropdown-transition")
        }, 50);

        this.container.classList.remove("overlay-active");
        this.container.classList.remove("dropdown-active");
        this.activeDropdown = undefined;
    };

    StripeMenu.prototype.toggleDropdown = function(e) {
        this.activeDropdown === e ? this.closeDropdown() : this.openDropdown(e)
    };

    StripeMenu.prototype.startCloseTimeout = function() {
        var e = this;
        e.closeDropdownTimeout = setTimeout(function() {
            e.closeDropdown()
        }, 50)
    };

    StripeMenu.prototype.stopCloseTimeout = function() {
        var e = this;
        clearTimeout(e.closeDropdownTimeout)
    };

    StripeMenuPopup.prototype.togglePopup = function() {
        var isActive = this.root.classList.contains(this.activeClass);

        this.closeAllPopups(true);
        isActive || this.root.classList.add(this.activeClass);
    };

    StripeMenuPopup.prototype.closeAllPopups = function(e) {
        var activeLinks = document.getElementsByClassName(this.activeClass);

        for (var i = 0; i < activeLinks.length; i++)
            activeLinks[i].classList.remove(this.activeClass)
    };
    
    $(function() {
        if ($scope.menu) {
            new StripeMenu($scope.menu);
            new StripeMenuPopup(".st-nav .st-nav-section.st-nav-mobile");
        }
    });
}(jQuery, this, {}));
