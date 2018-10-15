import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ContentTypesService {
  constructor(private http: HttpClient) {}

  public getContentTypes() {
    return this.http.get(environment.apiUrl + "api/contentTypes").toPromise();
  }

  public getContentType(id) {
    return this.http
      .get(environment.apiUrl + `api/contentTypes/${id}`)
      .toPromise();
  }
}
