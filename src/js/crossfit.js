new Swiper(".swiper", {
  direction: "horizontal",
  loop: false,
  speed: 1500,
  slidesPerView: 3,
  spaceBetween: 60,
 /*  mousewheel: true, */
  parallax: true,
 /*  centeredSlides: true, */
  effect: "coverflow",
  coverflowEffect: {
    rotate: 40,
    slideShadows: true
  },
/* autoplay: {
    delay: 2000,
    pauseOnMouseEnter: true
  },  */
 /*  pagination: {
    el: ".swiper-pagination"
  }, */
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  scrollbar: {
    el: ".swiper-scrollbar"
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
      spaceBetween: 60
    },
    600: {
      slidesPerView: 1,
      spaceBetween: 60
    },
    1024: {
      slidesPerView: 2,
      spaceBetween: 60
    },
    1400: {
      slidesPerView: 2,
      spaceBetween: 60
    },
    1920: {
      slidesPerView: 3,
      spaceBetween: 60
    },
    2900: {
      slidesPerView: 4,
      spaceBetween: 60
    }
  }
});


/* new Swiper('.swiper-container', {
    slidesPerView: 1, // Количество слайдов на один просмотр (слайды, видимые одновременно в контейнере слайдера).
    loop: true, // Режим непрерывного цикла.
    autoplay: {
      delay: 3000, // Задержка между переходами.
      pauseOnMouseEnter: true, // При включении автовоспроизведение будет приостановлено при наведении указателя (мыши) на контейнер Swiper.
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true, // Делаем точки кликабельными
    },
    speed: 800, // Продолжительность анимации при переключении точек в миллисекундах
  }); */
