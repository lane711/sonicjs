import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PageBuilderService {

  constructor(private http: HttpClient) { }

  isPageBuilder = false;
  
  async getPageById(id) {
    let url = `${environment.apiUrl}contents/getPageById?id=${id}`;
    console.log('url', url);
    return this.http.get(url).toPromise();
  }

}
