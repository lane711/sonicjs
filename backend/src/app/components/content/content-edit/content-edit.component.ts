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
  contentType: any;
  questions: any;
  isDataAvailable = false;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.loadContent();
  }

  loadContent(){
    this.contentService.getContentInstance(this.id).then(contentInstance =>{
      this.contentInstance = contentInstance;
      console.log(this.contentInstance);

      this.contentTypesService.getContentTypeBySystemIdPromise(this.contentInstance.contentType).then(data =>{
        console.log('>>>>loadContent.getContentTypeBySystemIdPromise', data);
        this.setQuestions(data[0].controls);
      });

      // if (this.contentTypesService.contentType) {
      //   this.setQuestions(this.contentTypesService.contentType.controls);
      // } else {
      //   this.loadQuestions(this.contentInstance.contentType);
      // }
    })
  }

  onSubmitContentAdd(payload) {
    console.log('onSubmitContentAdd:payload', payload);
    payload.contentType = this.contentTypesService.contentType.systemid;
    this.contentService.createContentInstance(payload);
  }

  // loadQuestions(contentTypeSystemId) {
  //   console.log('loadQuestions');
  //   this.contentTypesService.getContentTypeBySystemIdPromise(contentTypeSystemId).then(data => {
  //     // console.log(data);
  //     this.setQuestions(data.controls);
  //   });
  // }

  setQuestions(questions) {
    console.log('setQuestions');
    this.questions = questions;
    this.isDataAvailable = true;
  }

}
