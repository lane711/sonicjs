/*!
 * jquery.animatebar.js 1.1
 *
 * Copyright 2018, 5Studios.net https://www.5studios.net
 * Released under the GPL v2 License
 *
 * Date: Sep 13, 2018
 */
;(function($) {
    "use strict";

    var defaults = {
        delay: 100,
        step: 0,
        duration: 3000,
        orientation : "horizontal"
    };

    function AnimateBar(element, options) {
        this.config = options;
        this.element = element; //DOM element
        this.isHorizontal = this.config.orientation === "horizontal";

        this.init();
    }

    AnimateBar.prototype.init = function() {
        var t = this;

        new Waypoint({
            element: t.element,
            handler: function() {
                AnimateBar.prototype.animate.apply(t, null);
                this.destroy();
            },
            offset: '100%'
        });
    };

    AnimateBar.prototype.animate =  function() {
        var $element = $(this.element);
        var percent = $element.data("percent");
        var config = this.config;
        var isHorizontal = this.isHorizontal;

        setTimeout(function() {
            if (isHorizontal) {
                $(".progress-bar", $element).animate({
                    width: percent + "%"
                }, config.duration);
            } else {
                $(".progress-bar", $element).animate({
                    height: percent + "%"
                }, config.duration);
            }
        }, config.delay + config.step);
    };

    function BarChart(element, options) {
        this.config = $.extend({}, defaults, options);
        this.tag = element; //DOM element
        this.elements = options.elements; // Bars to generate

        this.renderBars();
        this.createAnimation();
    }

    BarChart.prototype.renderBars = function () {
        var options = this.config;
        var orientation = options.orientation;

        var bars = [];

        this.elements.forEach(function (element) {
            var barSize =  100;
            var percent = element.value;
            var style = element.style || {};

            var $progressBar = $("<div/>", {
                class: "progress-bar"
            });
            var $bar = $("<div/>", {
                class: "progress " + (style.progress || "progress-default"),
                html: $progressBar
            }).data("percent", percent);

            if (orientation === "horizontal") {
                $bar.css({ width: barSize + "%" });
                $progressBar.css({ width: 0 });
            } else {
                $bar.css({ height: barSize + "%" });
                $progressBar.css({ height: 0 });
            }

            var $legend = $("<p>", {
                html: [element.label, $("<span>", { html: percent + "%" })]
            });

            var $li = $("<li/>", { html: [$legend, $bar] });

            //$bar.data("animation", new AnimateBar($bar[0], $.extend({}, options, { step: (1 + index) * options.step })));

            bars.push($li);
        });

        $(this.tag)
            .append(bars)
            .addClass("progress-"+orientation);
    };

    BarChart.prototype.createAnimation = function () {
        var options = this.config;

        $("li .progress", this.tag).each(function(index) {
            $(this).data("animation", new AnimateBar(this, {
                delay: options.delay,
                step: (1 + index) * options.step,
                duration: options.duration,
                orientation : options.orientation
            }));
        });
    };

    $.fn.animateBar = function(options) {
        return this.each(function() {
            new BarChart(this, options);
        });
    };
})(jQuery);
