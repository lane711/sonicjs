import { QuestionBase } from "./question-base";

export class LayoutQuestion extends QuestionBase<string> {
  controlType = "layout";
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
  }
}
