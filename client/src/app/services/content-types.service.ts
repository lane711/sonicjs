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

  public addField(contentTypeId, fieldType) {
    // let contentTypeId = req.params.contentTypeId;
    //     var fieldType = {
    //         label: 'My Label',
    //         isRequired: false,
    //         fieldTypeId: req.body.fieldTypeId
    //     };
    // mongoDAL.addDocument("fieldTypes", fieldType).then(function (newFieldType) {
    //     //now add to contentType
    //     this.addFieldToContentType(contentTypeId, newFieldType);
    //     res.send(contentTypeId);
    // });
    //
    // contentType.fields.push({fieldInstanceId: fieldInstanceId});
  }
}
