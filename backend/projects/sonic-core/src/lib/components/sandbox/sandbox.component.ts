import { Component, OnInit } from '@angular/core';
// import { interval } from 'rxjs';

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

  }

  addCar(){
      let car = { name: "Honda" };
      this.cars.push(car);
  }

}
