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
  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
  }

  public addField(event, fieldType) {
    console.log(fieldType);
    this.contentTypesService;
  }
}
