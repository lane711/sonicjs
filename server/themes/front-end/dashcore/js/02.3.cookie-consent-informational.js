'use strict';

(function (C, U) {
    var pageState = U.initialisePopupSelector({
        cookieconsent: C,
        selector: document.querySelector('.example-selector-informational'),
        popups: {
            'Try it': {
                type: 'info',
                "palette": { "popup": { "background": "#383b75" }, "button": { "background": "#f1d600" } }
            }
        }
    });
}(window.cookieconsent, window.cookieconsent_example_util));