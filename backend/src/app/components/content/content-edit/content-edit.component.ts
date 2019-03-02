import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ContentService } from '../../../services/content.service';
import { ContentTypesService } from '../../../services/content-types.service'

@Component({
  selector: 'app-content-edit',
  templateUrl: './content-edit.component.html',
  styleUrls: ['./content-edit.component.css']
})
export class ContentEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService:ContentService,
    private contentTypesService:ContentTypesService) { }

  id:any;
  contentInstance: any;
  questions: any;
  isDataAvailable = false;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.loadContent();
  }

  loadContent(){
    this.contentService.getContentInstance(this.id).then(data =>{
      this.contentInstance = data;
      console.log(this.contentInstance);

      // this.contentTypesService.getContentTypeBySystemIdPromise(this.contentInstance.systemid).then(data =>{
      //   console.log(data);
      // });

      if (this.contentTypesService.contentType) {
        this.setQuestions(this.contentTypesService.contentType.controls);
      } else {
        this.loadQuestions();
      }
    })
  }

  onSubmitContentAdd(payload) {
    console.log('onSubmitContentAdd:payload', payload);
    payload.contentType = this.contentTypesService.contentType.systemid;
    this.contentService.createContentInstance(payload);
  }

  loadQuestions() {
    console.log('loadQuestions');
    this.contentTypesService.contentTypeSubject.subscribe(data => {
      // console.log(data);
      this.setQuestions(data.controls);
    });
  }

  setQuestions(questions) {
    console.log('setQuestions');

    this.questions = questions;
    this.isDataAvailable = true;
  }

}
