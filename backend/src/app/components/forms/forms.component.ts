import { Component, OnInit, Input } from "@angular/core";
import { QuestionBase } from "../../models/question-base";
import { FormGroup } from "@angular/forms";
import { QuestionControlService } from "../../services/question-control.service";
import { ContentTypesService } from "../../services/content-types.service";
import { ContentService } from "../../services/content.service";

import { UiService } from "../../services/ui.service";

@Component({
  selector: "app-forms",
  templateUrl: "./forms.component.html",
  styleUrls: ["./forms.component.css"],
  providers: [QuestionControlService]
})
export class FormsComponent implements OnInit {
  @Input()
  questions: QuestionBase<any>[] = [];
  @Input()
  onSubmitHandler: any;
  form: FormGroup;
  payLoad = "";

  constructor(
    private qcs: QuestionControlService,
    private contentTypesService: ContentTypesService,
    private contentService:ContentService,
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    //this.payLoad = JSON.stringify(this.form.value);
    this.payLoad = this.form.value;
    console.log('onSubmit', this.payLoad);
    //delagate back to the calling component
    this.onSubmitHandler(this.payLoad);
    this.uiService.showAside = false;
    // this.contentTypesService.contentInstance = JSON.stringify(this.form.value);
    // this.contentTypesService.createContentTypeInstanceSubmitSubject.next(
    //   JSON.stringify(this.form.value)
    // );
  }
}
