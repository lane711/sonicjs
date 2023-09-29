const dataGrid = new gridjs.Grid({
  columns: [
    "Title",
    {
      name: "Updated",
      formatter: (dt) => gridjs.html(`<time class="timeSince" datetime="${dt}">${dt}</time>`),
    },
  ],
  pagination: {
    limit: 5,
    server: {
      url: (prev, page, limit) =>
        `${prev}?limit=${limit}&offset=${page * limit}`,
    },
  },
  server: {
    url: `/admin/api/${getTable()}`,
    then: (data) => data.data.map((record) => [record.title, record.updatedOn]),
    total: (data) => data.total,
  },
}).render(document.getElementById("grid"));


$(document).on('.timeSince', function(){
  // $(this).html('<b>yaay!</b>');
  console.log('new time since')
});

function getTable() {
  return $("#grid").data("table");
}
