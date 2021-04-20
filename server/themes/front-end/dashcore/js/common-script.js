'use strict';

(function($) {
    $(function() {
        /**
         * Swiper Initialization
         **/
        $('.swiper-container').each(function() {

            var $this = $(this);
            var boolData = {
                breakpoints: $this.data('sw-breakpoints'),
                active_selector: $this.data('sw-active-selector'),
                cover_flow: $this.data('sw-coverflow'),
                auto_play: $this.data('sw-autoplay'),
                loop: $this.data('sw-loop'),
                centered: $this.data('sw-centered-slides'),
                pagination: $this.data('sw-pagination'),
                nav_arrows: $this.data('sw-nav-arrows'),
                dynamicBullets: $this.data('sw-dynamic-bullets')
            };

            var breakPoints = boolData.breakpoints || false;
            var auto_play = boolData.auto_play !== undefined ? boolData.auto_play : false;
            var speed = $this.data('sw-speed') || 1100;
            var effect = $this.data('sw-effect') || "slide";
            var showItems = $this.data('sw-show-items') || 1;
            var loop = boolData.loop !== undefined ? boolData.loop : true;
            var centered = boolData.centered !== undefined ? boolData.centered : true;
            var dynamicBullets = boolData.dynamicBullets !== undefined ? boolData.dynamicBullets : true;
            var spaceBetween = $this.data('sw-space-between') || (showItems > 1 ? 20 : 0);
            var scrollItems = $this.data('sw-scroll-items') || 1;
            var navigationElement = $this.data('sw-navigation');
            var navigationActiveClass = $this.data('sw-navigation-active') || "active";
            var navigationActiveSelector = boolData.active_selector !== undefined ? boolData.active_selector : false;
            var paginationCss = boolData.pagination !== undefined ? boolData.pagination : '.swiper-pagination';
            var navigationCss = boolData.nav_arrows !== undefined ? boolData.nav_arrows : '.swiper-button';

            var coverflow = boolData.cover_flow ? {
                coverflowEffect: $.extend({
                    stretch: 0,
                    depth: 0,
                    modifier: 1,
                    rotate: 0,
                    slideShadows: false
                }, boolData.cover_flow)
            } : {};

            var autoplay = auto_play ? {
                autoplay: {
                    delay: auto_play,
                    disableOnIteration: false
                },
                speed: speed
            } : {};

            var pagination = {};

            if (paginationCss) {
                pagination.pagination = {
                    el: paginationCss,
                    clickable: true
                };

                /* if (dynamicBullets) {
                    pagination.pagination.dynamicBullets = dynamicBullets;
                } */
            }

            if (navigationCss) {
                pagination.navigation = {
                    nextEl: navigationCss + '-next',
                    prevEl: navigationCss + '-prev'
                }
            }

            var events = {};

            /**/ if (navigationElement) {
                console.log("navigationElement swiper", navigationElement);
                events = {
                    transitionEnd: function () {
                        if (!navigationElement) return;

                        var $navigationElement = $(navigationElement);

                        if (navigationActiveSelector) {
                            $(navigationActiveSelector + '.' + navigationActiveClass, $navigationElement).removeClass(navigationActiveClass);
                            $('.nav-item:eq(' + swiper.realIndex + ') ' + navigationActiveSelector, $navigationElement).addClass(navigationActiveClass);
                        } else {
                            $('.' + navigationActiveClass, $navigationElement).removeClass(navigationActiveClass);
                            $('.nav-item:eq(' + swiper.realIndex + ')', $navigationElement).addClass(navigationActiveClass);
                        }
                    }
                }
            } /**/

            var options = $.extend({
                loop: loop,
                slidesPerGroup: scrollItems,
                spaceBetween: spaceBetween,
                centeredSlides: centered,
                breakpoints: breakPoints,
                slidesPerView: showItems,
                parallax: true,
                effect: effect
            }, pagination, autoplay, coverflow);

            var swiper = new Swiper (this, options);

            for (var e in events) {
                swiper.on(e, events[e]);
            }

            if (navigationElement) {
                $(navigationElement).on('click', '.nav-item', function (evt) {
                    evt.preventDefault();

                    var $item = $(this);
                    var $activeItem = $item;

                    if (navigationActiveSelector) {
                        $activeItem = $(navigationActiveSelector, $item);
                    }

                    if ($activeItem.hasClass(navigationActiveClass)) {
                        return false;
                    }

                    var index = $item.data('step') || $item.index() + 1;
                    swiper.slideTo(index);

                    if (navigationActiveSelector) {
                       $item.siblings().each(function() {
                           $(navigationActiveSelector, this).removeClass(navigationActiveClass);
                       });

                        $activeItem.addClass(navigationActiveClass);
                    } else {
                        $item.siblings('.'+navigationActiveClass).removeClass(navigationActiveClass);
                        $item.addClass(navigationActiveClass);
                    }

                    return false;
                });
            }
        });

        $('.scroll-bar').each(function (i, e) {
            var bar = new SimpleBar(e);
        });
    });
})(jQuery);
