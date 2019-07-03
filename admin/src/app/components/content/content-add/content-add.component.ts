import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ContentService } from "../../../../../projects/sonic-core/src/lib/services/content.service";
import { ContentTypesService } from "../../../../../projects/sonic-core/src/lib/services/content-types.service";

@Component({
  selector: 'app-content-add',
  templateUrl: './content-add.component.html',
  styleUrls: ['./content-add.component.css']
})
export class ContentAddComponent implements OnInit {

  constructor(private contentTypesService: ContentTypesService,
    private contentService: ContentService) { }

  contentTypes: any;
  contentType: any;
  questions: any;
  isFormDataAvailable = false;
  public components;
  public componentsJson = {
    components: []
  }

  @ViewChild('json') jsonElement?: ElementRef;
  public form: Object = { components: [] };

  onFormioChange(event) {
    this.components = event.form;
    // console.log('onFormioChange', ev˝ent.form);
  }

  ngOnInit() {
    this.loadContentTypeButton();
  }

  loadContentTypeButton() {
    this.contentTypesService.getContentTypes().then(contentTypes => {
      this.contentTypes = contentTypes;
    })
  }

  loadContentInstanceForm(contentType) {
    this.contentType = contentType;
    this.contentTypesService.getContentTypeBySystemIdPromise(contentType).then(contentType => {

      console.log('loadContentInstanceForm.contentType', contentType)
      this.componentsJson = contentType[0].components;

      if (contentType) {
        this.setQuestions(contentType[0].controls);
      } else {
        this.loadQuestions();
      }
    });

  }

  loadQuestions() {
    // console.log('loadQuestions');
    this.contentTypesService.contentTypeSubject.subscribe(data => {
      // console.log(data);
      this.setQuestions(data.controls);
    });
  }

  setQuestions(questions) {
    console.log('setQuestions', questions);

    this.questions = questions;
    this.isFormDataAvailable = true;
  }

  onSubmit(submission: any) {
    console.log('onSubmit', submission); // This will print out the full submission from Form.io API.
    let content = submission.data;
    content.contentType = this.contentType;
    this.contentService.createContentInstance(content);
  }

  onSubmitContentAdd(payload) {
    console.log('onSubmitContentAdd:payload', payload);
    payload.contentType = payload.contentTypeId;
    this.contentService.createContentInstance(payload);
    this.isFormDataAvailable = false;

  }

  public onCancelContentAdd(payload) {
    console.log('cancel add', payload);
    this.isFormDataAvailable = false;
    console.log('this.isFormDataAvailable', this.isFormDataAvailable);
  }

}
