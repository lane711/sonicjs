var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

module.exports = compareMainService = {
  startup: async function () {
    eventBusService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "COMPARE") {
        options.moduleName = "compare";
        await moduleService.processModuleInColumn(options);
      }
    });

    eventBusService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "COMPARE") {
        return;
      }

      let compareItems = await dataService.getContentByType("compare-item");
      options.viewModel.data.compareItems = compareItems;

      let contentType = await dataService.getContentType("compare-item");
      let tabs = contentType.data.components[0].components;
      options.viewModel.data.contentType = tabs;

      let matrix = compareMainService.getMatrixData(tabs, compareItems);
      console.log(matrix);
      options.viewModel.data.matrix = matrix;
    });
  },

  getMatrixData: function (contentType, compareItems) {
    let colspanCount = compareItems.length + 1;
    let rows = [];
    contentType.forEach((group) => {
      let row = { columns: [] };
      this.addCell(row, group.label, true, colspanCount, "main-group");
      rows.push(row);

      // console.log(group.label);
      group.components.forEach((element) => {
        let rowAlreadyProcessed = false;
        let row = { columns: [] };
        if (element.label === "Field Set") {
          var fieldSet = element.components[0];
          this.addCell(row, fieldSet.label, true, colspanCount, "category");
          rows.push(row);
          rowAlreadyProcessed = true;
          //now need another row for child components
          fieldSet.values.forEach((fieldSetValue) => {
            let row = { columns: [] };
            this.addCell(row, fieldSetValue.label, false, 0, "sub-category");

            //add columns for compare items
            compareItems.forEach((complareItem) => {
              let fieldSet = element.components[0];
              var fieldSetKey = fieldSet.key;
              let column = complareItem.data[fieldSetKey][fieldSetValue.value];
              if (column != undefined) {
                this.addCell(row, column);
              }
            });

            rows.push(row);
          });
        } else {
          if (element.label == "Content") {
            rowAlreadyProcessed = true;
          } else {
            this.addCell(row, element.label, false, 0, "category");
          }
        }

        //add columns for compare items
        compareItems.forEach((complareItem) => {
          if (element.label !== "Field Set") {
            let column = complareItem.data[element.key];
            this.addCell(row, column);
          }
        });

        if (!rowAlreadyProcessed) {
          rows.push(row);
        }
      });
    });
    return rows;
  },

  addCell: function (
    row,
    column,
    colspan = false,
    colspanCount = 0,
    cssClass = ""
  ) {
    let cell = { text: column };

    if (column.data && column.data.contentType === "compare-item-boolean") {
      cell.text = column.data.support;
      cell.notes = column.data.notes;
    }

    if (colspan) {
      cell.colspan = colspanCount;
    }
    if (cssClass) {
      cell.cssClass = cssClass;
    }

    if (column === true || cell.text === "true") {
      cell.text = '<i class="fa fa-check green"></i>';
    }

    if (column === false || cell.text === "false") {
      cell.text = '<i class="fa fa-times red"></i>';
    }

    if (cell.text === "partial") {
      cell.text = '<i class="fa fa-minus-square yellow"></i>';
    }

    if (cell.text === "plannedTrue") {
      cell.text = '<i class="fa fa-check light-green"></i>';
    }

    if (cell.notes) {
      let notesClean = cell.notes.replace(/"/g, "'");
      console.log(notesClean);
      cell.notes = `<button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="${notesClean}"><i class="fa fa-comment"></i></button>`;
    }

    row.columns.push(cell);
  },
};
