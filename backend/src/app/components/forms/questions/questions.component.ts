import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { QuestionBase } from "../../../models/question-base";

@Component({
  selector: "app-questions",
  templateUrl: "./questions.component.html",
  styleUrls: ["./questions.component.css"]
})
export class QuestionsComponent {
  constructor() { }

  @Input()
  question: QuestionBase<any>;
  @Input()
  form: FormGroup;

  showLabel = true;

  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

  ngOnInit() {
    this.processHidden();
  }

  processHidden() {
    if (this.question.controlType == 'hidden') {
      this.showLabel = false;
    }
  }
}
