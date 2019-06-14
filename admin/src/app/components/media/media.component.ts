import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaService } from "../../../../projects/sonic-core/src/lib/services/media.service";
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';


@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  constructor(private mediaService: MediaService) { }
  mediaList: any;

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null
  };

  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;

  ngOnInit() {
    this.loadMedia();
    this.setupDropzone();
    this.testPost();
  }

  async loadMedia() {
    this.mediaList = await this.mediaService.getMedia();
    // console.log('media', this.mediaList);
  }

  setupDropzone() {
    // this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; }; 
    // this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; }; 
  }

  public onUploadInit(args: any): void {
    args.options.dictDefaultMessage = 'drop em';
    args.options.withCredentials = false
    console.log('onUploadInit:', args);
  }

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
  }

  testPost() {
    //use working postman example
    // var data = new FormData();
    // data.append('file', 'http://placehold.it/300x500');

    // var xhr = new XMLHttpRequest();
    // xhr.withCredentials = false;
    // xhr.open('POST', 'http://localhost:3000/api/containers/container1/upload', true);
    // // xhr.setRequestHeader('Authorization', 'Client-ID xxxxxxxxxx');
    // xhr.send(data);


    // var xhr, formData;

    // xhr = new XMLHttpRequest();
    // xhr.withCredentials = false;
    // xhr.open('POST', "http://localhost:3000/api/containers/container1/upload");

    // xhr.onload = function () {
    //     var json;

    //     if (xhr.status != 200) {
    //         failure("HTTP Error: " + xhr.status);
    //         return;
    //     }

    //     json = JSON.parse(xhr.responseText);
    //     var file = json.result.files.file[0];
    //     var location = `http://localhost:3000/api/containers/${file.container}/download/${file.name}`;
    //     if (!location) {
    //         failure("Invalid JSON: " + xhr.responseText);
    //         return;
    //     }

    //     success(location);
    // };

    // formData = new FormData();
    // formData.append('file', 'http://placehold.it/300x500', 'myfile.jpg');
    // // formData.append('file', blobInfo.blob(), blobInfo.filename());

    // xhr.send(formData);

  }

}
