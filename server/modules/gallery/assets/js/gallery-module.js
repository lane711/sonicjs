// JS File for Module: gallery
// Initialise Carousel
$(document).ready(async function () {
  if ($("[data-fancybox]").length) {

    console.log("init fancybox");
    Fancybox.bind("[data-fancybox]", {
      // Your options go here
    });

    // const myCarousel = new Carousel(document.querySelector(".carousel"), {
    //   // Options
    // });
  }
});
