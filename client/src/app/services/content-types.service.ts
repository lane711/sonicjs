import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { FieldTypesService } from "./field-types.service";

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

  public contentType;

  public getContentTypes() {
    return this.http.get(environment.apiUrl + "contentTypes").toPromise();
  }

  public getContentType(id) {
    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `contentTypes/${id}?filter=${filter}`)
      .toPromise()
      .then(data => {
        this.contentType = data;
        this.addFieldsToContentType(this.contentType);
        console.log(data);
      });
  }

  public addFieldsToContentType(contentType) {
    contentType.fields.forEach(field => {
      let fieldInstance = this.fieldTypesService
        .getTypes()
        .find(x => x.fieldType == field.fieldType);
    });

    // field.html = systemSchema
    //   .getTypes()
    //   .find(x => x.id == fieldInstance.fieldTypeId)
    //   .generateHtml(field.fieldInstanceId);
    // field.label = fieldInstance.label;
  }

  async createContentTypeAsync(contentType): Promise<Object> {
    const newContentType = await this.http
      .post(environment.apiUrl + `contentTypes/`, contentType)
      .toPromise();

    const addField = this.addField(newContentType.id, "textBox");
    return newContentType;
  }

  async addField(contentTypeId, fieldType): Promise<Object> {
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

    console.log(response);
  }
}
