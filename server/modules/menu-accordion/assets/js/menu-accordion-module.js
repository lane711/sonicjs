// JS File for Module: menu-accordion

// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  scrollCheck();
};

// Get the navbar
var navbar = document.getElementById("accordian-menu");

// Get the offset position of the navbar
if (navbar) {
  var sticky = navbar.getBoundingClientRect().top - 90;
}

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function scrollCheck() {
  if (navbar) {
    if (window.pageYOffset >= sticky) {
      navbar.classList.add("sticky");
    } else {
      navbar.classList.remove("sticky");
    }
  }
}
