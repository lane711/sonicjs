import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  constructor(private http: HttpClient) { }

  async getContent() {
    let url = environment.apiUrl + "contents";
    console.log('url', url);
    return this.http.get(url).toPromise();
  }
}
