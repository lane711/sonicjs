import { Component, OnInit, Input } from "@angular/core";
import { QuestionBase } from "../../models/question-base";
import { FormGroup } from "@angular/forms";
import { QuestionControlService } from "../../services/question-control.service";
import { ContentTypesService } from "../../services/content-types.service";

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
  submitHandler: any;
  form: FormGroup;
  payLoad = "";

  constructor(
    private qcs: QuestionControlService,
    private contentTypesService: ContentTypesService
  ) {}

  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
    //delagate back to the calling component
    this.submitHandler(this.payLoad);
    // this.contentTypesService.contentInstance = JSON.stringify(this.form.value);
    // this.contentTypesService.createContentTypeInstanceSubmitSubject.next(
    //   JSON.stringify(this.form.value)
    // );
  }
}
