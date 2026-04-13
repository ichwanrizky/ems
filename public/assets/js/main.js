$(function () {
  "use strict";


  /* dark mode button */

  $(".dark-mode i").click(function () {
    $(this).text(function (i, v) {
      return v === 'dark_mode' ? 'light_mode' : 'dark_mode'
    })
  });


  $(".dark-mode").click(function () {
    $("html").attr("data-bs-theme", function (i, v) {
      return v === 'dark' ? 'light' : 'dark';
    })
  })


  /* sticky header */

  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 60) {
      $('.top-header .navbar').addClass('sticky-header');
    } else {
      $('.top-header .navbar').removeClass('sticky-header');
    }
  });


  /* switcher */

  $("#BlueTheme").on("click", function () {
    $("html").attr("data-bs-theme", "blue-theme")
  }),

  $("#LightTheme").on("click", function () {
    $("html").attr("data-bs-theme", "light")
  }),

  $("#DarkTheme").on("click", function () {
    $("html").attr("data-bs-theme", "dark")
  }),

  $("#SemiDarkTheme").on("click", function () {
    $("html").attr("data-bs-theme", "semi-dark")
  }),

  $("#BoderedTheme").on("click", function () {
    $("html").attr("data-bs-theme", "bodered-theme")
  })


  /* search control */

  $(".search-control").click(function () {
    $(".search-popup").addClass("d-block");
    $(".search-close").addClass("d-block");
  });

  $(".search-close").click(function () {
    $(".search-popup").removeClass("d-block");
    $(".search-close").removeClass("d-block");
  });

  $(".mobile-search-btn").click(function () {
    $(".search-popup").addClass("d-block");
  });

  $(".mobile-search-close").click(function () {
    $(".search-popup").removeClass("d-block");
  });


});
