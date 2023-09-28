function deselect(){
    gridOptions.api.deselectAll()
}

// Grid Options are properties passed to the grid
const gridOptions = {

  // each entry here represents one column
  columnDefs: [
    { field: "title" },
    { field: "updatedOn" },
  ],

  // default col def properties get applied to all columns
  defaultColDef: {sortable: true, filter: true},

  rowSelection: 'multiple', // allow rows to be selected
  animateRows: true, // have rows animate to new positions when sorted

  // example event handler
  onCellClicked: params => {
    console.log('cell was clicked', params)
  }
};

// get div to host the grid
const eGridDiv = document.getElementById("myGrid");
// new grid instance, passing in the hosting DIV and Grid Options
new agGrid.Grid(eGridDiv, gridOptions);

// Fetch data from server
fetch("/admin/api/users")
.then(response => response.json())
.then(results => {
    // debugger;
  // load fetched data into grid
  gridOptions.api.setRowData(results.data);
});