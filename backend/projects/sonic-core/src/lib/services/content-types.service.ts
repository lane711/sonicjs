import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// import { environment } from "src/app/environments/environment";
var environment = {apiUrl : 'http://localhost:3000/api/'};

import { HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { FieldTypesService } from "./field-types.service";
import { QuestionBase } from "../models/question-base";
import { TextboxQuestion } from "../models/question-textbox";
import { HiddenQuestion } from "../models/question-hidden";
import { DropdownQuestion } from "../models/question-dropdown";
import { TextareaQuestion } from "../models/question-textarea";
import { WYSIWYGQuestion } from "../models/question-wysiwyg";

import { LayoutQuestion } from "../models/question-layout";


import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ContentTypesService {
  constructor(
    private http: HttpClient,
    private fieldTypesService: FieldTypesService
  ) {
    this.onCreateContentTypeInstanceSubmit();
  }

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "my-auth-token"
    })
  };

  //TODO; try below and remove isdataavilable flag
  // public contentTypeSubject = new BehaviorSubject(this.contentType);

  public contentTypeSubject = new Subject<any>();
  public contentTypeSubmitted = new Subject<any>();
  public contentTypeCreated = new Subject<any>();

  public contentType: any;
  public contentTypeControls: any;
  public contentInstance: any;

  public getContentTypes() {
    return this.http.get(environment.apiUrl + "contentTypes").toPromise();
  }

  onCreateContentTypeInstanceSubmit() {
    this.contentTypeSubmitted.subscribe(data => {
      console.log("onCreateContentTypeInstanceSubmit Subject arrived:", data);
      this.createContentTypeAsync(data).then(data => {
        this.contentTypeCreated.next(data);
        return data;
      });
    });
  }

  public getContentType(id) {
    // We subscribe to the subject
    // this.contentTypeSubject.subscribe(data => {
    //   console.log("Subscriber got data >>>>> ", data);
    // });

    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `contentTypes/${id}?filter=${filter}`)
      .toPromise()
      .then(data => {
        this.contentType = data;
        this.processContentTypeFields(data);
        this.contentTypeSubject.next(data);
        // this.contentTypeSubject.complete();
      });
  }

  public getContentTypePromise(id) {
    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `contentTypes/${id}?filter=${filter}`)
      .toPromise();
  }

  async getContentTypeBySystemIdPromise(systemid) {
    const filter = encodeURI(`{"include": "fields","where":{"systemid":"${systemid}"}}`);
    this.contentType = await this.http
      .get(environment.apiUrl + `contentTypes?filter=${filter}`)
      .toPromise();
      this.processContentTypeFields(this.contentType[0]);
      console.log('after processContentTypeFields', this.contentType)
      return this.contentType;
  }

  public updateContentTypeField(fieldData){
    console.log('fieldData', fieldData); 

    this.getContentTypePromise(fieldData.contentTypeId).then(contentType =>{
      let ct: any = contentType;
      
      ct.fieldList.filter(field => field.id === fieldData.fieldId)[0].label = fieldData.label;
      ct.fieldList.filter(field => field.id === fieldData.fieldId)[0].systemid = fieldData.systemid;

      this.putContentTypeAsync(contentType).then(updateContentType =>{
        console.log('updateContentType', updateContentType);
        this.contentType = updateContentType;
        // this.processContentTypeFields(updateContentType);
        // this.contentTypeSubject.next(updateContentType);
        // this.contentTypeSubject.complete();
      })
    })
  }

  public processContentTypeFields(contentType) {
    let controls: QuestionBase<any>[] = [];
    this.addBaseContentTypeFields(contentType, controls);
    if (contentType.fields) {
      contentType.fields.forEach(field => {

        // console.log('fieldcontrol', field);
        if(field.fieldType == 'textBox'){
          let control = new TextboxQuestion({
            key: field.systemid,
            label: field.label,
            value: "",
            required: field.required,
            order: 1
          });
          controls.push(control);
        }

        if(field.fieldType == 'textarea'){
          let control = new TextareaQuestion({
            key: field.systemid,
            label: field.label,
            value: "",
            required: field.required,
            order: 1
          });
          controls.push(control);
        }

        if(field.fieldType == 'layout'){
          let control = new LayoutQuestion({
            key: field.systemid,
            label: field.label,
            value: "",
            required: field.required,
            order: 1
          });
          controls.push(control);
        }

        if(field.fieldType == 'wysiwyg'){
          let control = new WYSIWYGQuestion({
            key: field.systemid,
            label: field.label,
            value: "",
            required: field.required,
            order: 1
          });
          controls.push(control);
        }
        

      });
    }
    contentType.controls = controls;
  }

  private addBaseContentTypeFields(contentType, controls){
    console.log('addBaseContentTypeFields', contentType, controls);
    // if(isToBePopulatedWithExistingContent){
      let controlId = new HiddenQuestion({
        key: 'id',
        label: 'Id',
        value: contentType.id,
        required: true,
        order: 0
      });
      controls.push(controlId);

      let controlContentType = new HiddenQuestion({
        key: 'contentTypeId',
        label: 'Content Type',
        value: contentType.systemid,
        required: true,
        order: 1
      });
      controls.push(controlContentType);
    // }
  }

  async createContentTypeAsync(contentType): Promise<Object> {
    console.log('createContentTypeAsync', contentType);
    const newContentType = await this.http
      .post(environment.apiUrl + `contentTypes/`, contentType)
      .toPromise();
      console.log('createContentTypeAsync created!');

    let defaultField =  {
        "fieldType" : "textBox", 
        "systemid" : "url", 
        "label" : "Url", 
        "placeholder" : "Url", 
        "required" : true
    }
    
    const addField = await this.addFieldToContentType(newContentType, defaultField);
    return newContentType;
  }

  async putContentTypeAsync(contentType): Promise<Object> {
    console.log('putContentTypeAsync.contentType', contentType);
    return this.http
      .put(environment.apiUrl + `contentTypes/`, contentType)
      .toPromise();
  }

  async addFieldToContentType(contentType, field): Promise<Object> {

    console.log('adding field for ' + contentType.id, field)

    return await this.http
      .post(
        environment.apiUrl + `contentTypes/${contentType.id}/fields`,
        field,
        this.httpOptions
      )
      .toPromise();
  }

  async deleteContentTypeAsync(contentTypeId): Promise<Object> {
    return await this.http
      .delete(environment.apiUrl + `contentTypes/${contentTypeId}`)
      .toPromise();
  }

  async deleteFieldFromContentType(contentTypeId, fieldId): Promise<Object> {
    return this.http
      .delete(
        environment.apiUrl + `contentTypes/${contentTypeId}/fields/${fieldId}`
      )
      .toPromise();
  }

  
}
