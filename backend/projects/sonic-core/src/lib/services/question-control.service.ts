import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { QuestionBase } from "../models/question-base";

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: QuestionBase<any>[]) {
    let group: any = {};

    if (questions) {
      questions.forEach(question => {
        group[question.key] = question.required
          ? new FormControl(question.value || "", Validators.required)
          : new FormControl(question.value || "");
      });
    }
    return new FormGroup(group);
  }
}
