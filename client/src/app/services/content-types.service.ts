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
  ) {}

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "my-auth-token"
    })
  };

  public contentTypeSubject = new Subject();

  public contentType;

  public getContentTypes() {
    return this.http.get(environment.apiUrl + "contentTypes").toPromise();
  }

  public getContentType(id) {
    // We subscribe to the subject
    this.contentTypeSubject.subscribe(data => {
      console.log("Subscriber got data >>>>> ", data);
    });

    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `contentTypes/${id}?filter=${filter}`)
      .toPromise()
      .then(data => {
        this.contentType = data;
        this.processContentTypeFields(this.contentType);
        this.contentTypeSubject.next(this.contentType);
        this.contentTypeSubject.complete();
      });
  }

  public processContentTypeFields(contentType) {
    let controls: QuestionBase<any>[] = [];
    if (contentType.fields) {
      contentType.fields.forEach(field => {
        let control = new TextboxQuestion({
          key: "firstName",
          label: field.label,
          value: "BombastoXL",
          required: false,
          order: 1
        });
        controls.push(control);
      });
    }
    contentType.controls = controls;
    console.log(contentType);
  }

  public processContentTypeFieldsOld(contentType) {
    if (contentType.fields) {
      contentType.fields.forEach(field => {
        let fieldInstance = this.fieldTypesService
          .getTypes()
          .find(x => x.name === field.fieldType);
      });
    }
  }

  async createContentTypeAsync(contentType): Promise<Object> {
    const newContentType = await this.http
      .post(environment.apiUrl + `contentTypes/`, contentType)
      .toPromise();

    // const addField = this.addFieldToContentType(newContentType.id, "textBox");
    return newContentType;
  }

  async addFieldToContentType(contentTypeId, fieldType): Promise<Object> {
    let fieldData = {
      fieldType: fieldType,
      label: "Title",
      placeholder: "Enter Title Text",
      required: false
    };

    let response = await this.http
      .post(
        environment.apiUrl + `contentTypes/${contentTypeId}/fields`,
        fieldData,
        this.httpOptions
      )
      .toPromise()
      .catch((err: HttpErrorResponse) => {
        console.error("An error occurred:", err.error);
      });

    return "ok";
  }
}
