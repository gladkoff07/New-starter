// Import Libs from npm

import { Fancybox } from "@fancyapps/ui";
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Fancybox init
Fancybox.bind("[data-fancybox]", {
  animationEffect: "zoom-in-out",
  slideClass: "modal-close",
});

// Swiper init
const swiperName = new Swiper(".js-slider-name", {
  // configure Swiper to use modules
  modules: [Navigation, Pagination],

  slidesPerView: 1,
  roundLengths: true,
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});