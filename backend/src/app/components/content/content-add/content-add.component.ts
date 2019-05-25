import { Component, OnInit } from '@angular/core';
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
  questions: any;
  isFormDataAvailable = false;

  ngOnInit() {
    this.loadContentTypeButton();
  }

  loadContentTypeButton() {
    this.contentTypesService.getContentTypes().then(contentTypes => {
      this.contentTypes = contentTypes;
    })
  }

  loadContentInstanceForm(contentType){
    this.contentTypesService.getContentTypeBySystemIdPromise(contentType).then(contentType => {
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
