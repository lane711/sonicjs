// admin js

$(document).ready(function () {
  setupClearCacheButtons();
  applyTimeSince();

  $('.delete-content').on('click', function () {
    const id = $(this).attr('data-id');
    alert(`Permanantly Delete: ${id}?`);
    console.log('deleting ', id);

    axios.delete(`/v1/content/${id}`).then((response) => {
      location.href = `/admin`;
    });
  });
  // console.log(timeSince(new Date(Date.now()-aDay)));

  // debugger;
});

function applyTimeSince() {
  $('.timeSince').each(function (index, value) {
    // console.log(value);
    const timestamp = $(this).attr('datetime');
    $(this).text(timeSince(timestamp));
  });
}

function timeSince(date) {
  console.log('timesince for', date);

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
}

function setupClearCacheButtons() {
  $('#clear-cache-in-memory').on('click', function () {
    axios.get(`/v1/cache/clear-in-memory`).then((response) => {
      if (response.status === 200) {
        window.location = '/admin/cache/in-memory';
      }
    });
  });

  $('#clear-cache-kv').on('click', function () {
    axios.get(`/v1/cache/clear-kv`).then((response) => {
      if (response.status === 200) {
        window.location = '/admin/cache/kv';
      }
    });
  });

  $('#clear-cache-all').on('click', function () {
    axios.get(`/v1/cache/clear-all`).then((response) => {
      if (response.status === 200) {
        location.reload();
      }
    });
  });
}
