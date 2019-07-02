import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FieldTypesService } from "../../../../../projects/sonic-core/src/lib/services/field-types.service";
import { ContentTypesService } from "../../../../../projects/sonic-core/src/lib/services/content-types.service";
import { UiService } from "../../../../../projects/sonic-core/src/lib/services/ui.service";
import * as shortid from 'node_modules/shortid';
import { Router } from "@angular/router";

declare var jQuery: any;

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
    private uiService: UiService
  ) { }

  @ViewChild('json') jsonElement?: ElementRef;
  public form: Object = { components: [] };

  onFormioChange(event) {
    this.components = event.form;
    // console.log('onFormioChange', ev˝ent.form);
  }

  public components;
  public componentsJson = {
    components: []
  }

  public fieldTypes;
  public fields;

  async onSave() {
    console.log('saving...', this.contentTypesService.contentType.id);
    let contentType = await this.contentTypesService.getContentTypePromise(this.contentTypesService.contentType.id) as any;
    if(this.components){
      contentType.components = this.components;
    }
    await this.contentTypesService.putContentTypeAsync(contentType);
    console.log('contentType', contentType);
  }

  ngOnInit() {
    this.loadContentType();
    this.fieldTypes = this.fieldTypesService.getTypes();
    // this.componentsJson = JSON.stringify(this.components);
    console.log('ngOnInit this.componentsJson', this.components);
    // this.form.components = this.components
  }

  loadContentType(){
    this.contentTypesService.contentTypeSubject.subscribe(data => {
      console.log('loadContentType', data);
      this.componentsJson = data.components;
    });
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

  public saveLabel(id, newLabel) {
    this.contentTypesService.getContentType(id).then(data => {
      // console.log('updating field for:', data);
    });
  }

  public refresh() {
    //TODO: we shouldn't need to fully reload the page, just the data
    location.reload();
  }

  goToFieldEdit(fieldId) {
    this.uiService.toggleSideAside(fieldId);

    this.router.navigate(
      ['/content-types/' + this.contentTypesService.contentType.id],
      { queryParams: { 'fieldId': fieldId } }
    );
  }
}
