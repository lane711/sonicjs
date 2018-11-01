import { Component, OnInit } from "@angular/core";
import { FieldTypesService } from "../../../services/field-types.service";
import { ContentTypesService } from "../../../services/content-types.service";

@Component({
  selector: "app-content-type-edit-fields",
  templateUrl: "./content-type-edit-fields.component.html",
  styleUrls: ["./content-type-edit-fields.component.css"]
})
export class ContentTypeEditFieldsComponent implements OnInit {
  constructor(
    private fieldTypesService: FieldTypesService,
    private contentTypesService: ContentTypesService
  ) {}

  public fieldTypes;
  public fields;
  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
    // this.fields = this.contentTypesService.getContentType(
    //   "5bb7f1784aa4d63b1ea1cfcb"
    // );
  }

  public addField(event, fieldType) {
    this.contentTypesService.addFieldToContentType(
      this.contentTypesService.contentType.id,
      fieldType.name
    );
    //close modal
  }
}
