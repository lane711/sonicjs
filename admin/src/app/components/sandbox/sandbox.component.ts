import { Component, OnInit, ElementRef, ViewChild  } from '@angular/core';
// import { interval } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  @ViewChild('json') jsonElement?: ElementRef;
  public form: Object = {components: []};
  onChange(event) {
    console.log(event.form);
  }
  constructor() { }

  cars: any;
  ngOnInit() {
    let car = { name: "Mercedes" };
    this.cars = [];
    this.cars.push(car);
    this.cars.push(car);

    // this.loadwysiwyg();


  }

  loadwysiwyg(){
    $('textarea.wysiwyg-content').tinymce({
      selector: '#block-content',
      plugins: 'image imagetools',
      toolbar: 'formatselect | bold italic strikethrough forecolor backcolor permanentpen formatpainter | link image media pageembed | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | addcomment',
      image_advtab: false,
      image_list: [
        {title: 'My image 1', value: 'https://www.tinymce.com/my1.gif'},
        {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
      ],
      images_upload_url: 'postAcceptor.php',
      automatic_uploads: false
   });
  }
  
  addCar(){
      let car = { name: "Honda" };
      this.cars.push(car);
  }

}
