import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ContentTypesService } from "../../../services/content-types.service";
import { TextboxQuestion } from "../../../models/question-textbox";
import { DropdownQuestion } from "../../../models/question-dropdown";

@Component({
  selector: 'app-content-type-edit-field',
  templateUrl: './content-type-edit-field.component.html',
  styleUrls: ['./content-type-edit-field.component.css']
})
export class ContentTypeEditFieldComponent implements OnInit {

  constructor(private route: ActivatedRoute, private contentTypesService:ContentTypesService) { }

  fieldId: string;
  field: any;

  isDataAvailable = false;
  questions = [
    new TextboxQuestion({
      key: "id",
      label: "id",
      value: 'this.fieldId',
      required: false,
      order: 1
    }),

    new TextboxQuestion({
      key: "label",
      label: "Label",
      value: "my lable",
      required: false,
      order: 2
    }),

    new DropdownQuestion({
      key: "isRequired",
      label: "Required",
      options: [{ key: "true", value: "true" }, { key: "false", value: "false" }],
      order: 3
    }),
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        this.fieldId = params['fieldId'];
        this.loadField(this.fieldId);
    });
  }

loadField(fieldId){
  this.contentTypesService.contentTypeSubject.subscribe(data => {
    if(fieldId){
      console.log('loadField.contentType', this.contentTypesService.contentType);
      this.field = this.contentTypesService.contentType.fieldList.filter(field => field.id === fieldId);
      console.log('loadField->field', this.field);
      this.questions[0].value = fieldId;
      this.questions[1].value = this.field[0].label;
      this.isDataAvailable = true;
    }
  });

}

onSubmitFieldEdit(payload){
  if (payload) {
    // console.log("payload", payload);

    let self = this;
    this.contentTypesService.updateContentTypeField(this.contentTypesService.contentType.id, payload);

  }
}

}
