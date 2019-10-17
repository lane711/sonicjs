// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-example-user-management
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var config = require('../../server/config.json');
var path = require('path');

//Replace this address with your actual address
var senderAddress = 'test@test.com';

module.exports = function (User) {

  User.afterRemote('login', function(ctx){
    ctx.res.cookie('access_token', ctx.result.id, { signed: true, maxAge: ctx.result.ttl * 1000 });
    return Promise.resolve();
  });

  User.afterRemote('logout', function(ctx){
    ctx.res.clearCookie('access_token');
    return Promise.resolve();
  });

  // User.beforeRemote('create', function (context, user, next) {
  //   let x = 1;
  //   // next();
  // });

  //send verification email after registration
  User.afterRemote('create', function (context, user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: senderAddress,
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    // user.verify(options, function (err, response) {
    //   if (err) {
    //     User.deleteById(user.id);
    //     return next(err);
    //   }
    //   context.res.render('response', {
    //     title: 'Signed up successfully',
    //     content: 'Please check your email and click on the verification link ' +
    //       'before logging in.',
    //     redirectTo: '/',
    //     redirectToLinkText: 'Log in'
    //   });
    // });
  });

  // Method to render
  User.afterRemote('prototype.verify', function (context, user, next) {
    context.res.render('response', {
      title: 'A Link to reverify your identity has been sent ' +
        'to your email successfully',
      content: 'Please check your email and click on the verification link ' +
        'before logging in',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  //send password reset link when requested
  User.on('resetPasswordRequest', function (info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

  //render UI page after password change
  User.afterRemote('changePassword', function (context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Please login again with new password',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  //render UI page after password reset
  User.afterRemote('setPassword', function (context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });
};
