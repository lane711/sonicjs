import { Component, OnInit, Input } from "@angular/core";
import { QuestionBase } from "../../models/question-base";
import { FormGroup } from "@angular/forms";
import { QuestionControlService } from "../../services/question-control.service";

@Component({
  selector: "app-forms",
  templateUrl: "./forms.component.html",
  styleUrls: ["./forms.component.css"],
  providers: [QuestionControlService]
})
export class FormsComponent implements OnInit {
  @Input()
  questions: QuestionBase<any>[] = [];
  form: FormGroup;
  payLoad = "";

  constructor(private qcs: QuestionControlService) {}

  ngOnInit() {
    console.log(this.questions);
    this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }
}
