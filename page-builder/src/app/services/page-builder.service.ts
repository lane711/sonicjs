import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";

var environment = {apiUrl : 'http://localhost:3000/api/'};

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
    console.log('loading page from ' + url);
    let page = await this.http.get(url).toPromise() as any;
    console.log('pushing page ', page);
    this.currentPageSubject.next(page.data);
  }

  setIsPageBuilder(isPageBuilder){
    console.log('setIsPageBuilder', isPageBuilder);
    this.isPageBuilderChanged.next(isPageBuilder);
  }
}
