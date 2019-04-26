import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public showAside = false;

  public showAlertMessage = false;
  public showAlertMessageText = '';


  public lastFieldIdSelected: any;
  
  constructor() { }


  toggleSideAside(fieldId) {
    this.showAside = true;
    if (this.lastFieldIdSelected == fieldId) {
      this.showAside = false;
      this.lastFieldIdSelected = null;
    } else {
      this.lastFieldIdSelected = fieldId;
    }
  }

  showGrowlMessage(message){

  }
}
