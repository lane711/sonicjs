'use strict';

(function (C, U) {
    var pageState = U.initialisePopupSelector({
        cookieconsent: C,
        selector: document.querySelector('.example-selector-opt-out'),
        popups: {
            'Try it': {
                type: 'opt-out',
                "palette": { "popup": { "background": "#383b75" }, "button": { "background": "#f1d600" } }
            }
        }
    });
}(window.cookieconsent, window.cookieconsent_example_util));