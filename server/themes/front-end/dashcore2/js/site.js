/**
 * Title:   Dashcore - HTML App Landing Page - Main Javascript file
 * Author:  http://themeforest.net/user/5studiosnet
 **/

(function() {
    'use strict';

    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any code in here.
$(function(){
    'use strict';

    /** navbar reference **/
    var $navbar = $(".main-nav"),
        stickyPoint = 90;

    /** Perspective mockups reference **/
    var $perspectiveMockups = $(".perspective-mockups");

    // This element is used as reference for relocation of the mockups on mobile devices.
    // If you remove it please be sure you add another reference element preferably within the same section and/or position the button was.
    // You can change the selector (".learn-more") to one that uniquely identifies the reference element.
    var $topReference = $(".learn-more", ".lightweight-template");

    var setMockupsTop = function() {
        // check if the perspective mockups elements are on the page, if you're not going to use them, you can remove all its references
        if (!$perspectiveMockups.length) return;

        if ($(window).outerWidth() < 768) {
            $perspectiveMockups.css({top: $topReference.offset().top + "px"});
            return;
        }

        $perspectiveMockups.removeAttr("style");
    };

    var navbarSticky = function() {
        if ($(window).scrollTop() >= stickyPoint) {
            $navbar.addClass("navbar-sticky");
        } else {
            $navbar.removeClass("navbar-sticky");
        }
    };

    /**
     * STICKY MENU
     **/
    $(window).on("scroll", navbarSticky);

    navbarSticky();

    /**
     * SCROLLING NAVIGATION
     * Enable smooth transition animation when scrolling
     **/
    $('a.scrollto').on('click', function (event) {
        event.preventDefault();

        var scrollAnimationTime = 1200;
        var target = this.hash;

        $('html, body').stop().animate({
            scrollTop: $(target).offset().top - 45
        }, scrollAnimationTime, 'easeInOutExpo', function () {
            window.location.hash = target;
        });
    });

    /**
     *  NAVBAR SIDE COLLAPSIBLE - On Mobiles
     **/
    $(".navbar-toggler", $navbar).on("click", function() {
        if (!$navbar.is('.st-nav')) $navbar.toggleClass("navbar-expanded");
    });

    /**
     * Blog interaction with buttons: favorite and bookmark
     **/
    $('.card-blog').on({
        click: function (e) {
            e.preventDefault();

            var $el = $(this).removeClass('far').addClass('fas');
            if ($el.hasClass('favorite')) {
                $el.addClass('text-danger');
            } else {
                $el.addClass('text-warning');
            }
        },
        mouseenter: function () {
            $(this).addClass('fas');
        },
        mouseleave: function () {
            $(this).removeClass('fas');
        }
    }, 'i.far');

    /**
     * Position the perspective mockups at the end of the first content section on mobile
     **/
    $perspectiveMockups.removeClass("hidden-preload");
    $(window).on("resize", setMockupsTop);

    setMockupsTop();

    /** PLUGINS INITIALIZATION */
    /* Bellow this, you can remove the plugins you're not going to use.
     * If you do so, remember to remove the script reference within the HTML.
     **/

    /**
     * Handle the login form, once the server has sent a successful response
     **/
    $('.login-form form').on('form.submitted', function(evt, data) {
        window.location.replace('admin/');
    });

    /**
     * Prettyprint
     **/
    window.prettyPrint && prettyPrint();

    /**
     * AOS
     * Cool scrolling animations
     **/
    AOS.init({
        offset: 100,
        duration: 1500,
        disable: 'mobile'
    });

    /**
     * typed.js
     **/
    if ($(".typed").length) {
        $(".typed").each(function (i, el) {
            var strings =  $(el).data("strings");

            var typed = new Typed('.typed', {
                strings: strings,
                typeSpeed: 150,
                backDelay: 500,
                backSpeed: 50,
                loop: true
            });
        });
    }

    /**
     * COUNTERS
     **/
    if ($(".counter").length) {
        $(".counter").each(function(i, el) {
            new Waypoint({
                element: el,
                handler: function() {
                    counterUp.default(el);
                    this.destroy();
                },
                offset: 'bottom-in-view'
            });
        });
    }

    /**
     * POPUPS
     **/
    (function() {
        $('.modal-popup').each(function () {
            var $element = $(this);

            // Some default to apply for all instances of Modal
            var defaults = {
                removalDelay: 500,
                preloader: false,
                midClick: true,
                callbacks: {
                    beforeOpen: function() {
                        this.st.mainClass = this.st.el.attr('data-effect');
                    }
                }
            };

            // Defaults to use for specific types
            var typeDefaults = {
                image: {
                    closeOnContentClick: true
                },
                gallery: {
                    delegate: 'a',
                    // when gallery is used change the type to 'image'
                    type: 'image',
                    tLoading: 'Loading image #%curr%...',
                    mainClass: 'mfp-with-zoom mfp-img-mobile',
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                        preload: [0,1] // Will preload 0 - before current, and 1 after the current image
                    },
                    image: {
                        tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
                    }
                }
            };

            // Load configuration values from data attributes
            var type = $element.data('type') || 'inline';
            var zoomSpeed = $element.data('zoom') || false;
            var focus = $element.data('focus') || false;

            var attributes = {};

            if (zoomSpeed) {
                attributes.zoom = {
                    enabled: true,
                    duration: zoomSpeed
                }
            }

            if (focus) {
                attributes.focus = focus;
            }

            // According to the type, get the JSON configuration for each
            $.each(['image', 'gallery'], function () {
                var attr = $element.data(this) || false;

                if (attr) {
                    typeDefaults[type][this] = attr;
                }

                // remove the values from the markup
                $element.removeAttr("data-" + this);
            });

            var options = $.extend({}, defaults, {
                type: type
            }, typeDefaults[type], attributes);

            // $element.magnificPopup(options);
        });

        $(document).on('click', '.modal-popup-dismiss', function (e) {
            e.preventDefault();
            $.magnificPopup.close();
        });
    })();

    /**
     * ANIMATION BAR
     **/
    (function () {
        $(".whyus-progress-bars").animateBar({
            orientation: "horizontal",
            step: 100,
            duration: 1000,
            elements: [
                { label: "Implementation", value: 73, style: { progress: "progress-xs" } }, // style: { progress: "progress-4" }
                { label: "Design", value: 91, style: { progress: "progress-xs" } },
                { label: "Beauty", value: 97, style: { progress: "progress-xs" } },
                { label: "Branding", value: 61, style: { progress: "progress-xs" } },
                { label: "Responsiveness", value: 100, style: { progress: "progress-xs" }  }
            ]
        });
    })();

    /**
     * Feather Icons
     **/
    feather.replace();

    /**
     * Prismjs
     **/


    /**
     * PRICING TABLES
     **/
    $(".pricing-table-basis").on("change", 'input[name="pricing-value"]', function() {
        var period = this.value;

        $(".odometer").each(function() {
            this.innerHTML = $(this).data(period + "-price");
        });
    });

    // TODO: isolate wizard stuff in a single file
    /** WIZARD
     * Each wizard has its own configuration, if you're going to use one or another please make sure the selector matches the one used bellow
     * You can remove the code you're not going to use to speed up the site.
     **/
    (function() {
        var defaultConfig = {
            showStepURLhash: false, // not show the hash on URL
            theme: 'circles',
            anchorSettings: {
                enableAllAnchors: true, // Activates all anchors clickable all times
                removeDoneStepOnNavigateBack: true // remove the "done" on visited steps when navigating back
            },
            useURLhash: true // Enable selection of the step based on url hash
        };


        // Save the wizard variable, we'll used it below to work with it
        var $formWizard = $("#form-wizard");
        var options = $.extend({}, defaultConfig, {
            contentURL: "wizard/get-form/",
            ajaxSettings: {
                type: 'GET'
            }
        });

    })();
});
