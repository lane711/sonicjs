import { Component, OnInit} from "@angular/core";
import { FieldTypesService } from "../../../services/field-types.service";
import { ContentTypesService } from "../../../services/content-types.service";
import { UiService } from "../../../services/ui.service";

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
  private lastFieldIdSelected: string;

  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
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
    this.toggleSideAside(fieldId);
    
    this.router.navigate(
      ['/admin/content-types/' + this.contentTypesService.contentType.id], 
      { queryParams: { 'fieldId': fieldId } }
    );
  }

  toggleSideAside(fieldId){
    this.uiService.showAside = true;
    if(this.lastFieldIdSelected == fieldId){
      this.uiService.showAside = false;
      this.lastFieldIdSelected = null;
    } else{
      this.lastFieldIdSelected = fieldId;
    }
  }
}
