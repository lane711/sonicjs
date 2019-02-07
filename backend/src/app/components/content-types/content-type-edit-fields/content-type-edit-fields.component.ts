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
        self.refresh();
      });
  }

  public deleteField(fieldId) {
    const self = this;
    this.contentTypesService
      .deleteFieldFromContentType(
        this.contentTypesService.contentType.id,
        fieldId
      )
      .then(() => {
        self.refresh();
      });
  }

  public saveLabel(id, newLabel){
    this.contentTypesService.getContentType(id).then(data =>{
      console.log('updating field for:', data);
    });
  }

  public refresh() {
    //TODO: we shouldn't need to fully reload the page, just the data
    location.reload();
  }

  goToFieldEdit(fieldId){
    this.router.navigate(
      ['/admin/content-types/' + this.contentTypesService.contentType.id], 
      { queryParams: { 'fieldId': fieldId } }
  );
  }
}
