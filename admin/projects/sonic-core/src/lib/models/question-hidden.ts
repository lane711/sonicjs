import { QuestionBase } from "./question-base";

export class HiddenQuestion extends QuestionBase<string> {
  controlType = "hidden";
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
  }
}
