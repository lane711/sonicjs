import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { ContentTypesService } from "../../../../../projects/sonic-core/src/lib/services/content-types.service";
import { UiService } from "../../../../../projects/sonic-core/src/lib/services/ui.service";

import { TextboxQuestion } from "../../../../../projects/sonic-core/src/lib/models/question-textbox";
import { DropdownQuestion } from "../../../../../projects/sonic-core/src/lib/models/question-dropdown";
import { HiddenQuestion } from '../../../../../projects/sonic-core/src/lib/models/question-hidden';

@Component({
  selector: "app-content-type-edit",
  templateUrl: "./content-type-edit.component.html",
  styleUrls: ["./content-type-edit.component.css"]
})
export class ContentTypeEditComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService,
    private uiService: UiService
  ) {}

  public contentType;
  isDataAvailable = false;

  questions = [
    // new HiddenQuestion({
    //   key: "contentTypeId",
    //   label: "",
    //   required: false,
    //   order: 1
    // }),

    // new HiddenQuestion({
    //   key: "fieldId",
    //   label: "fieldId",
    //   value: "",
    //   required: false,
    //   order: 2
    // }),

    new TextboxQuestion({
      key: "systemid",
      label: "System Id",
      value: "",
      required: false,
      order: 3
    }),

    new TextboxQuestion({
      key: "name",
      label: "Name",
      value: "",
      required: false,
      order: 4
    }),

    // new DropdownQuestion({
    //   key: "isRequired",
    //   label: "Required",
    //   options: [{ key: "true", value: "true" }, { key: "false", value: "false" }],
    //   order: 5
    // }),
  ];
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.contentTypesService.getContentType(id).then(data =>{
      this.contentType = this.contentTypesService.contentType;
      this.isDataAvailable = true;
      this.loadFormData();
    });
  }

  loadFormData(){
      this.questions.find(q => q.key === 'systemid').value = this.contentType.systemid;
      this.questions.find(q => q.key === 'name').value = this.contentType.name;
  }

  onSubmitContentTypeEdit(payload){
    this.contentTypesService.contentType.systemid = payload.systemid;
    this.contentTypesService.contentType.name = payload.name;
console.log('saving...', this.contentTypesService.contentType);
    this.contentTypesService.putContentTypeAsync(this.contentTypesService.contentType).then(updateContentType =>{
      console.log('updateContentType', updateContentType);
      this.uiService.showAlertMessage = true;
      this.uiService.showAlertMessageText = 'Content Type Saved :)';

      // this.contentType = updateContentType;
      // this.processContentTypeFields(updateContentType);
      // this.contentTypeSubject.next(updateContentType);
      // this.contentTypeSubject.complete();
    })
  }
}
