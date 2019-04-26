import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ContentTypesService } from "projects/sonic-core/src/lib/services/content-types.service";
import { TextboxQuestion } from "projects/sonic-core/src/lib/models/question-textbox";
import { DropdownQuestion } from "projects/sonic-core/src/lib/models/question-dropdown";
import { HiddenQuestion } from 'projects/sonic-core/src/lib/models/question-hidden';
import { UiService } from "projects/sonic-core/src/lib/services/ui.service";

@Component({
  selector: 'app-content-type-edit-field',
  templateUrl: './content-type-edit-field.component.html',
  styleUrls: ['./content-type-edit-field.component.css']
})
export class ContentTypeEditFieldComponent implements OnInit {

  constructor(private route: ActivatedRoute, private uiService: UiService, private contentTypesService: ContentTypesService) {

  }

  fieldId: string;
  field: any;
  fields: any;
  routerSubscription: any;
  isDataAvailable = false;

  questions = [
    new HiddenQuestion({
      key: "contentTypeId",
      label: "",
      required: false,
      order: 1
    }),

    new HiddenQuestion({
      key: "fieldId",
      label: "fieldId",
      value: "",
      required: false,
      order: 2
    }),

    new TextboxQuestion({
      key: "systemid",
      label: "System Id",
      value: "",
      required: false,
      order: 3
    }),

    new TextboxQuestion({
      key: "label",
      label: "Label",
      value: "my lablel",
      required: false,
      order: 4
    }),

    new DropdownQuestion({
      key: "isRequired",
      label: "Required",
      options: [{ key: "true", value: "true" }, { key: "false", value: "false" }],
      order: 5
    }),
  ];

  ngOnInit() {
    // console.log('init uiService', this.uiService);

    this.contentTypesService.contentTypeSubject.subscribe(data => {
      this.fields = this.contentTypesService.contentType.fields;
      this.routerSubscription = this.route.queryParams.subscribe(params => {
        this.isDataAvailable = false;
        if (this.fields && params['fieldId']) {
          this.fieldId = params['fieldId'];
          this.populateForm(this.fieldId);
        }
      });
    });
  }

  //TODO: must be a better way
  async refreshQuestionsControl() {
    this.isDataAvailable = false;
    await this.delay(1);
    this.isDataAvailable = true;
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  populateForm(fieldId) {
    this.field = this.fields.filter(field => field.id === fieldId)[0];
    this.questions.find(q => q.key === 'contentTypeId').value = this.contentTypesService.contentType.id;
    this.questions.find(q => q.key === 'fieldId').value = this.field.id;
    this.questions.find(q => q.key === 'systemid').value = this.field.systemid;
    this.questions.find(q => q.key === 'label').value = this.field.label;
    this.refreshQuestionsControl();
  }

  onSubmitFieldEdit(payload) {
    if (payload) {
      this.contentTypesService.updateContentTypeField(payload);
    }
  }

}
