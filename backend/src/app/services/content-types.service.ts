import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { FieldTypesService } from "./field-types.service";
import { QuestionBase } from "../models/question-base";
import { TextboxQuestion } from "../models/question-textbox";
import { DropdownQuestion } from "../models/question-dropdown";
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
        console.log("contentTypeSubject:Next");
        this.contentTypeSubject.next(data);
        console.log("contentTypeSubject:complete");
        this.contentTypeSubject.complete();
      });
  }

  public getContentTypePromise(id) {
    // We subscribe to the subject
    // this.contentTypeSubject.subscribe(data => {
    //   console.log("Subscriber got data >>>>> ", data);
    // });

    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `contentTypes/${id}?filter=${filter}`)
      .toPromise();
  }

  public processContentTypeFields(contentType) {
    let controls: QuestionBase<any>[] = [];
    if (contentType.fields) {
      contentType.fields.forEach(field => {
        let control = new TextboxQuestion({
          key: field.id,
          label: field.label,
          value: "",
          required: field.required,
          order: 1
        });
        controls.push(control);
      });
    }
    contentType.controls = controls;
  }

  // public processContentTypeFieldsOld(contentType) {
  //   if (contentType.fields) {
  //     contentType.fields.forEach(field => {
  //       let fieldInstance = this.fieldTypesService
  //         .getTypes()
  //         .find(x => x.name === field.fieldType);
  //     });
  //   }
  // }

  async createContentTypeAsync(contentType): Promise<Object> {
    let contentTypeJson = JSON.parse(contentType);
    const newContentType = await this.http
      .post(environment.apiUrl + `contentTypes/`, contentTypeJson)
      .toPromise();

    const addField = this.addFieldToContentType(newContentType, "textBox");
    return newContentType;
  }

  async putContentTypeAsync(contentType): Promise<Object> {
    return this.http
      .put(environment.apiUrl + `contentTypes/`, contentType)
      .toPromise();
  }

  async addFieldToContentType(contentTypeId, fieldType): Promise<Object> {
    let fieldData = {
      fieldType: fieldType,
      label: "Title",
      placeholder: "Enter Title Text",
      required: false
    };

    return await this.http
      .post(
        environment.apiUrl + `contentTypes/${contentTypeId}/fields`,
        fieldData,
        this.httpOptions
      )
      .toPromise();

    // let response = await this.http
    //   .post(
    //     environment.apiUrl + `contentTypes/${contentTypeId}/fields`,
    //     fieldData,
    //     this.httpOptions
    //   )
    //   .toPromise()
    //   .catch((err: HttpErrorResponse) => {
    //     console.error("An error occurred:", err.error);
    //   });
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
