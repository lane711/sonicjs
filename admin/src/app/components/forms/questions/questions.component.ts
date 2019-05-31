import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { QuestionBase } from "../../../../../projects/sonic-core/src/lib/models/question-base";

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

  start: number;
  end: number;
  content = '';

  showLabel = true;

  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

  ngOnInit() {
    console.log('questions.comonent question:', this.question);
    this.processHidden();
  }

  processHidden() {
    if (this.question.controlType == 'hidden') {
      this.showLabel = false;
    }
  }

  onSelect(start, end) {
    console.log(start, end);
    this.start = start;
    this.end = end;
  }

  wrapTag(tag) {
    let last = this.content.substr(this.end);
    let toBeWrapped = this.content.substr(this.start, this.end - this.start);
    let first = this.content.substr(0, this.start);
    this.content = first + `<${tag}>` + toBeWrapped + `</${tag}>` + last;
  }

  insert(tag) {
    let last = this.content.substr(this.end);
    let toBeWrapped = this.content.substr(this.start, this.end - this.start);
    let first = this.content.substr(0, this.start);
    this.content = first + `${tag}` + toBeWrapped + last;
  }

}
