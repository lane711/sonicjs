import { Component, OnInit, Input } from "@angular/core";
import { ContentTypesService } from "../../../services/content-types.service";
import { FieldTypesService } from "../../../services/field-types.service";
import { FormControl, FormGroup, NgControlStatus } from "@angular/forms";
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

  questions: any;
  isDataAvailable = false;

  instanceForm = new FormGroup({
    title: new FormControl(),
    firstName: new FormControl()
  });
  ngOnInit() {
    console.log("ContentTypeEditCreateInstanceComponent:OnInit");
    console.log("questions", this.questions);

    if (this.contentTypesService.contentType) {
      this.setQuestions(this.contentTypesService.contentType.controls);
    } else {
      this.loadQuestions();
    }
  }

  subscribeOnFormSubmit() {
    // this.formsComponent.formSubmittedSubject.subscribe(data => {
    //   console.log("formsComponent.formSubmittedSubject arrived:", data);
    // });
  }

  createInstance() {
    // TODO: Use EventEmitter with form value
    console.log(this.contentTypesService.contentInstance);
    console.warn(this.instanceForm.value);
  }

  loadQuestions() {
    this.contentTypesService.contentTypeSubject.subscribe(data => {
      console.log(data);
      this.setQuestions(data.controls);
    });
  }

  setQuestions(questions) {
    this.questions = questions;
    this.isDataAvailable = true;
  }
}
