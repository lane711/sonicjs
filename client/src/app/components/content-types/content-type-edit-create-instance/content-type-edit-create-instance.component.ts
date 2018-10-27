import { Component, OnInit, Input } from "@angular/core";
import { ContentTypesService } from "../../../services/content-types.service";
import { FieldTypesService } from "../../../services/field-types.service";
import { FormControl, FormGroup } from "@angular/forms";
import { QuestionService } from "../../../services/question.service";

@Component({
  selector: "app-content-type-edit-create-instance",
  templateUrl: "./content-type-edit-create-instance.component.html",
  styleUrls: ["./content-type-edit-create-instance.component.css"],
  providers: [QuestionService]
})
export class ContentTypeEditCreateInstanceComponent implements OnInit {
  constructor(
    private contentTypesService: ContentTypesService,
    private fieldTypesService: FieldTypesService,
    private questionService: QuestionService
  ) {}

  questions: any[];

  instanceForm = new FormGroup({
    title: new FormControl(),
    firstName: new FormControl()
  });
  ngOnInit() {
    this.loadQuestions();
  }

  createInstance() {
    // TODO: Use EventEmitter with form value
    console.warn(this.instanceForm.value);
  }

  loadQuestions() {
    this.questions = this.questionService.getQuestions();
  }
}
