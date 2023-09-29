const dataGrid = new gridjs.Grid({
  columns: [
    {
      name: "Title",
      formatter: (title, editPath) => gridjs.html(`<a href="${editPath}">${title}`),
    },
    { 
      name: 'editPath',
      hidden: true
    },
    {
      name: "Updated",
      formatter: (dt) => gridjs.html(`<time class="timeSince" datetime="${dt}">${dt}</time>`),
    },
    'Email',
      { 
        name: 'Actions',
        formatter: (cell, row) => {
          return gridjs.h('button', {
            className: 'btn btn-warning',
            onClick: () => alert(`Editing "${row.cells[0].data}" "${row.cells[1].data}"`)
          }, 'Edit');
        }
      },
  ],
  pagination: {
    limit: 20,
    server: {
      url: (prev, page, limit) =>
        `${prev}?limit=${limit}&offset=${page * limit}`,
    },
  },
  server: {
    url: `/admin/api/${getTable()}`,
    then: (data) => data.data.map((record) => [record.title, record.editPath, record.updatedOn]),
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
