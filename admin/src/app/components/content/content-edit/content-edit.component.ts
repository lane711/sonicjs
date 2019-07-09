import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ContentService } from '../../../../../projects/sonic-core/src/lib/services/content.service';
import { ContentTypesService } from '../../../../../projects/sonic-core/src/lib/services/content-types.service'

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
  public components;
  public componentsJson = {
    components: []
  }
  formData:any;

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    console.log('content edit route', this.route.snapshot);
    this.loadContentTypeForm();
  }

   async loadContentTypeForm(){
     this.contentInstance = await this.contentService.getContentInstance(this.id);
     let data = this.contentInstance.data;
     this.formData = { data } ;
     console.log('this.formData ', this.formData )

     this.contentType = await this.contentTypesService.getContentTypeBySystemIdPromise(this.formData.data.contentType);
     this.componentsJson = this.contentType[0].components;

  
      this.isDataAvailable = true;

      // this.contentTypesService.getContentTypeBySystemIdPromise(this.contentInstance.data.contentType).then(data =>{
      //   this.setQuestions(data[0].controls);
      //   this.loadContentIntoContentTypeForm();
      // });
    // })
  }

  async loadContentIntoContentTypeForm(){
    // console.log('this.questions', this.questions)
    this.contentService.loadFormDataFromMatchingPropNames(this.questions, this.contentInstance);
  }

  onSubmit(payload) {
    console.log('onSubmitContentAdd:payload', payload);
    this.contentInstance.data = payload.data;
    console.log('onSubmitContentAdd:payload-this.contentInstance', this.contentInstance);
    // payload.contentType = payload.contentTypeId;
    // delete payload.contentTypeId;
    this.contentService.editContentInstance(this.contentInstance);
  }

  // loadQuestions(contentTypeSystemId) {
  //   console.log('loadQuestions');
  //   this.contentTypesService.getContentTypeBySystemIdPromise(contentTypeSystemId).then(data => {
  //     // console.log(data);
  //     this.setQuestions(data.controls);
  //   });
  // }

  setQuestions(questions) {
    // console.log('setQuestions', questions);
    this.questions = questions;
    this.isDataAvailable = true;
  }

}
