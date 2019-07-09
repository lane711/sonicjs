import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FieldTypesService } from "../../../../projects/sonic-core/src/lib/services/field-types.service";
declare var $: any;

@Component({
  selector: "app-field-types",
  templateUrl: "./field-types.component.html",
  styleUrls: ["./field-types.component.css"]
})
export class FieldTypesComponent implements OnInit {
  constructor(private fieldTypesService: FieldTypesService) { }

  @ViewChild('json') jsonElement?: ElementRef;
  public form: Object = { components: [] };
  onChange(event) {
    console.log(event.form);
  }

  // public fieldTypes;
  ngOnInit() {
    // this.fieldTypes = await this.fieldTypesService.getTypes();
    this.loadFieldType();
  }

  loadFieldType() {
    $(document).ready(function () {

      function generateButtonList(container, dest) {
        let buttonListHtml = '';
        $(`${container} span`).each(function () {
          let text = $(this).text();
          let icon = $(this).children('i').first().attr('class');
          buttonListHtml += `<button class="btn btn-outline-primary btn-lg rmargin tmargin"><i class="${icon}"></i>${text}</button>`;
        });

        $(`${dest}`).html(buttonListHtml);

      }

      generateButtonList('#group-container-basic', '#basicFieldList');
      generateButtonList('#group-container-advanced', '#advancedFieldList');
      generateButtonList('#group-container-layout', '#layoutFieldList');
      generateButtonList('#group-container-data', '#dataFieldList');


    });
  }
}
