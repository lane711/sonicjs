import { Component, OnInit } from "@angular/core";
import { FieldTypesService } from "../../../services/field-types.service";
import { ContentTypesService } from "../../../services/content-types.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-content-type-edit-fields",
  templateUrl: "./content-type-edit-fields.component.html",
  styleUrls: ["./content-type-edit-fields.component.css"]
})
export class ContentTypeEditFieldsComponent implements OnInit {
  constructor(
    private fieldTypesService: FieldTypesService,
    private contentTypesService: ContentTypesService,
    private router: Router
  ) {}

  public fieldTypes;
  public fields;
  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
    // this.fields = this.contentTypesService.getContentType(
    //   "5bb7f1784aa4d63b1ea1cfcb"
    // );
    // this.router.navigate(["/content-types", "12"]);
  }

  public addField(event, fieldType) {
    const self = this;
    this.contentTypesService
      .addFieldToContentType(
        this.contentTypesService.contentType.id,
        fieldType.name
      )
      .then(() => {
        console.log("routing to" + this.contentTypesService.contentType.id);
        self.router.navigate([
          "/content-types",
          self.contentTypesService.contentType.id
        ]);
      });
  }

  public refresh(event, fieldType) {
    this.router.navigate([
      "/content-types",
      this.contentTypesService.contentType.id
    ]);
  }
}
