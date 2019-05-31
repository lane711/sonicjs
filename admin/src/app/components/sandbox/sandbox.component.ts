import { Component, OnInit } from '@angular/core';
// import { interval } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  constructor() { }

  cars: any;
  ngOnInit() {
    let car = { name: "Mercedes" };
    this.cars = [];
    this.cars.push(car);
    this.cars.push(car);

    // Create an Observable that will publish a value on an interval
    // const secondsCounter = interval(1000);
    // Subscribe to begin publishing values
    // secondsCounter.subscribe(n => {
    //   console.log(`It's been ${n} seconds since subscribing!`);
    //   let car = { name: "Audi" };

    //   if(this.cars.length < 5){
    //   this.cars.push(car);
    //   }
    // });

    // window.tinyMCE.overrideDefaults({
    //   base_url: '/admin/tinymce/',  // Base for assets such as skins, themes and plugins
    //   suffix: '.min'          // This will make Tiny load minified versions of all its assets
    // });

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
