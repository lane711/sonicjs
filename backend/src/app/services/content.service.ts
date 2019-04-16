import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  constructor(
    private http: HttpClient
  ) { }

  async getContent() {
    return this.http.get(environment.apiUrl + "contents").toPromise();
  }

  async getContentInstance(id) {
    return this.http.get(environment.apiUrl + "contents/" + id).toPromise();
  }

  public createContentInstance(payload) {
    console.log('createContentInstance payload', payload);
    let content:any = {};
    content.data = {};
    this.processContentFields(payload, content);
    console.log('content', content);
    return this.http.post(environment.apiUrl + "contents/", content).toPromise();
  }

  public editContentInstance(payload) {
    console.log('createContentInstance payload', payload);
    let content:any = {};
    content.data = {};
    this.processContentFields(payload, content);
    console.log('saving existing content', content);
    return this.http.put(environment.apiUrl + `contents/${content.id}`, content).toPromise();
  }

  private processContentFields(payload, content){
    for (var property in payload) {
      if (payload.hasOwnProperty(property)) {
        if(property == 'url'){
          content.url = payload.url;
          continue;
        }
        content.data[property] = payload[property];
      }
    }
  }

  public loadFormDataFromMatchingPropNames(questions, content){
    console.log('loadFormDataFromMatchingPropNames.questions', questions);
    console.log('loadFormDataFromMatchingPropNames.content', content);

    for (var property in content) {
      if (content.hasOwnProperty(property)) {
        this.populateFormField(questions, content, property);
      }
    }

    for (var property in content.data) {
      if (content.data.hasOwnProperty(property)) {
        this.populateFormField(questions, content, property);
      }
    }
  }

  private populateFormField(questions, content, property){
    let questionToPopulate = questions.find(q => q.key === property)
    console.log('questionToPopulate', questionToPopulate);
    if(questionToPopulate){
      if(property == 'url'){
        questionToPopulate.value = content[property];
      }else{
        questionToPopulate.value = content.data[property];
      }
    }
  }
}
