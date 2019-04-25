import { QuestionBase } from "./question-base";

export class WYSIWYGQuestion extends QuestionBase<string> {
  controlType = "wysiwyg";
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
  }
}
