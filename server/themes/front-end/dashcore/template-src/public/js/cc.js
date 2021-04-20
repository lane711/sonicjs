/**
 * Title:   Dashcore - HTML App Landing Page - Credit Card Form file
 * Author:  http://themeforest.net/user/5studiosnet
 *
 * This snippet uses the card package, please refer to its docs in order to customize it
 * https://www.npmjs.com/package/card
 **/

'use strict';

$(function() {
    var paymentForm = document.querySelector('.checkout-cc-payment-form');

    if (paymentForm) {
        var card = new Card({
            form: paymentForm,
            container: '.card-wrapper',
            masks: {
                cardNumber: '•' // optional - mask card number
            }
        });
    }
});
