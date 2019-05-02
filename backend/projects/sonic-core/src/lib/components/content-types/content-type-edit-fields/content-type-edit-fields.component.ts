import { Component, OnInit} from "@angular/core";
import { FieldTypesService } from "projects/sonic-core/src/lib/services/field-types.service";
import { ContentTypesService } from "projects/sonic-core/src/lib/services/content-types.service";
import { UiService } from "projects/sonic-core/src/lib/services/ui.service";
import  * as shortid from 'node_modules/shortid';
import { Router } from "@angular/router";

declare var jQuery:any;

@Component({
  selector: "app-content-type-edit-fields",
  templateUrl: "./content-type-edit-fields.component.html",
  styleUrls: ["./content-type-edit-fields.component.css"]
})
export class ContentTypeEditFieldsComponent implements OnInit {
  constructor(
    private fieldTypesService: FieldTypesService,
    private contentTypesService: ContentTypesService,
    private router: Router,
    private uiService:UiService
  ) {}

  public fieldTypes;
  public fields;

  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
  }

  public addField(event, field) {
    const self = this;
console.log('addField.fieldType', field);
    let fieldData = {
      fieldType: field.name,
      systemid: shortid.generate(),
      label: "Name",
      placeholder: "Enter Name",
      required: false
    };

    this.contentTypesService
      .addFieldToContentType(
        this.contentTypesService.contentType,
        fieldData
      )
      .then(() => {
        // console.log("routing to" + this.contentTypesService.contentType.id);
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
      // console.log('updating field for:', data);
    });
  }

  public refresh() {
    //TODO: we shouldn't need to fully reload the page, just the data
    location.reload();
  }

  goToFieldEdit(fieldId){
    this.uiService.toggleSideAside(fieldId);
    
    this.router.navigate(
      ['/content-types/' + this.contentTypesService.contentType.id], 
      { queryParams: { 'fieldId': fieldId } }
    );
  }
}
