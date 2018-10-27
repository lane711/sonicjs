import { Injectable } from "@angular/core";

import { DropdownQuestion } from "../models/question-dropdown";
import { QuestionBase } from "../models/question-base";
import { TextboxQuestion } from "../models/question-textbox";

@Injectable()
export class QuestionService {
  // TODO: get from a remote source of question metadata
  // TODO: make asynchronous
  getQuestions() {
    let questions: QuestionBase<any>[] = [
      new DropdownQuestion({
        key: "brave",
        label: "Bravery Rating",
        options: [
          { key: "solid", value: "Solid" },
          { key: "great", value: "Great" },
          { key: "good", value: "Good" },
          { key: "unproven", value: "Unproven" }
        ],
        order: 3
      }),

      new TextboxQuestion({
        key: "firstName",
        label: "First name",
        value: "BombastoXL",
        required: true,
        order: 1
      }),

      new TextboxQuestion({
        key: "firstName",
        label: "First name",
        value: "BombastoXL",
        required: true,
        order: 1
      }),

      new TextboxQuestion({
        key: "emailAddress",
        label: "Email",
        type: "email",
        order: 5
      })
    ];

    return questions.sort((a, b) => a.order - b.order);
  }
}
