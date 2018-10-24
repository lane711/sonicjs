import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ContentTypesService {
  constructor(private http: HttpClient) {}

  public contentType;

  public getContentTypes() {
    return this.http.get(environment.apiUrl + "api/contentTypes").toPromise();
  }

  public getContentType(id) {
    const filter = encodeURI('{"include": "fields"}');
    return this.http
      .get(environment.apiUrl + `api/contentTypes/${id}?filter=${filter}`)
      .toPromise()
      .then(data => {
        this.contentType = data;
        console.log(data);
      });
  }

  // public async createContentType(contentType) {
  //   // return this.http
  //   //   .post(environment.apiUrl + `api/contentTypes/`, contentType)
  //   //   .toPromise().then(data => {
  //   //     this.addField(data.id, 'textBox');
  //   //   });
  //   let data = await this.http.post(
  //     environment.apiUrl + `api/contentTypes/`,
  //     contentType
  //   );
  //   console.log("newContentType", data);
  //   return this.addField(data.id, "textBox").toPromise();
  // }

  async createContentTypeAsync(contentType): Promise<number> {
    const response = await this.http
      .post(environment.apiUrl + `api/contentTypes/`, contentType)
      .toPromise();
    return response;
  }

  public addField(contentTypeId, fieldType) {
    let field = {
      fieldType: "string",
      label: "string",
      placeholder: "string",
      required: false
    };
    return this.http.post(
      environment.apiUrl + `api/contentTypes/${contentTypeId}/fields`,
      field
    );
  }
}
