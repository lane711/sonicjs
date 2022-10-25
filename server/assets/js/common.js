$(document).ready(async function () {
  // console.log('share service test: ' + sharedService.test());

  setupToolTips();
});

function submitForm(submission) {
  console.log("front end form submitting: ", submission);

  // send a POST request
  axios({
    method: "post",
    url: "/form-submission",
    data: {
      data: submission,
    },
  });
}

async function submitFormAndRedirect(submission, redirectTo) {
  console.log("front end form submitting: ", submission);

  // send a POST request
  let result = await axios({
    method: "post",
    url: "/form-submission",
    data: {
      data: submission,
    },
  });

  if(result.status !== 200){
    alert('Error submitting form, please try again');
  }

  if(redirectTo){
    window.location.href = redirectTo;
  }
}

function setupToolTips() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      html: true,
    });
  });
}

function testFunction(echo) {
  return echo;
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}