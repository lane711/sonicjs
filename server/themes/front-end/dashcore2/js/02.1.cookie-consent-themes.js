'use strict';

(function (C, U) {
    var palettes = {
        honeybee: { "popup": { "background": '#000' }, "button": { "background": '#f1d600', padding: '5px 25px' } },
        blurple: { "popup": { "background": '#3937a3' }, "button": { "background": '#e62576' } },
        mono: { "popup": { "background": "#237afc" }, "button": { "background": "transparent", "border": "#fff", "text": "#fff", padding: '5px 40px' } },
        nuclear: { "popup": { "background": "#aa0000", "text": "#ffdddd" }, "button": { "background": "#ff0000" } },
        cosmo: { "popup": { "background": "#383b75" }, "button": { "background": "#f1d600", padding: '5px 50px' } },
        neon: { "popup": { "background": "#1d8a8a" }, "button": { "background": "#62ffaa" } },
        corporate: { "popup": { "background": "#edeff5", "text": "#838391" }, "button": { "background": "#4b81e8" } }
    };

    var cookiePopups = U.initialisePopupSelector({
        cookieconsent: C,
        selector: document.querySelector('.example-selector-themes'),
        popups: {
            'Mono': {
                type: 'info',
                position: 'bottom',
                palette: palettes.mono
            },
            'Honeybee': {
                type: 'info',
                position: 'top',
                palette: palettes.honeybee
            },
            'Blurple': {
                type: 'opt-out',
                position: 'bottom-left',
                palette: palettes.blurple,
                content: {
                    "message": "You can override the text that appears in an alert too.",
                    "dismiss": "Awesome"
                }
            },
            'Nuclear': {
                type: 'info',
                position: 'bottom-right',
                theme: "edgeless",
                palette: palettes.nuclear,
                content: {
                    "dismiss": "I accept certain doom"
                }
            },
            'Cosmo': {
                type: 'opt-out',
                position: 'bottom',
                palette: palettes.cosmo
            },
            'Neon': {
                type: 'info',
                theme: "classic",
                position: 'bottom-left',
                palette: palettes.neon
            }/*,
            'Corporate': {
                type: 'info',
                position: 'top',
                palette: palettes.corporate,
                static: true,
                content: {
                    "dismiss": "Dismiss"
                }
            }*/
        }
    });
}(window.cookieconsent, window.cookieconsent_example_util));
