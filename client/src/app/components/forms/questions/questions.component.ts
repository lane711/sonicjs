import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-questions",
  templateUrl: "./questions.component.html",
  styleUrls: ["./questions.component.css"]
})
export class QuestionsComponent implements OnInit {
  constructor() {}

  @Input()
  question: QuestionBase<any>;
  @Input()
  form: FormGroup;
  get isValid() {
    return this.form.controls[this.question.key].valid;
  }

  ngOnInit() {}
}
