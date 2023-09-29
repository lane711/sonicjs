// admin js

$(document).ready(function () {
  applyTimeSince();

  $(".delete-content").on("click", function () {
    const id = $(this).attr("data-id")
    alert(`Permanantly Delete: ${id}?`);
    console.log("deleting ", id);

    axios.delete(`/v1/content/${id}`).then((response) => {
      location.href = `/admin`;

    });
  });
  // console.log(timeSince(new Date(Date.now()-aDay)));

  // debugger;
});

function applyTimeSince(){
  $(".timeSince").each(function (index, value) {
    // console.log(value);
    const timestamp = $(this).attr("datetime");
    $(this).text(timeSince(timestamp));
  });
}

function timeSince(date) {
  console.log("timesince for", date);

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}
