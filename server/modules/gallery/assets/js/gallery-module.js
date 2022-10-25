// JS File for Module: gallery
// Initialise Carousel
$(document).ready(async function () {
    console.log('init fancybox');

    Fancybox.bind("[data-fancybox]", {
        // Your options go here
      });

      const myCarousel = new Carousel(document.querySelector(".carousel"), {
        // Options
      });
      
});
