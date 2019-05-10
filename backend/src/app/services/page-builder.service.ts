import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PageBuilderService {

  constructor(private http: HttpClient) { }

  public isPageBuilderChanged = new Subject<any>();
  public currentPageSubject = new Subject<any>();

  isPageBuilder = false;
  
  async getPageById(id) {
    let url = `${environment.apiUrl}contents/getPageById?id=${id}`;
    console.log('url', url);
    return this.http.get(url).toPromise();
  }

  async loadPageIntoSubjectById(id) {
    let url = `${environment.apiUrl}contents/getPageById?id=${id}`;
    let page = await this.http.get(url).toPromise();
    this.currentPageSubject.next(page);
  }

  setIsPageBuilder(isPageBuilder){
    console.log('setIsPageBuilder', isPageBuilder);
    this.isPageBuilderChanged.next(isPageBuilder);
  }

}
