document.addEventListener('DOMContentLoaded', function () {
  !(function (o) {
    'use strict';
    o('body')
      .on('input propertychange', '.floating-label-form-group', function (i) {
        o(this).toggleClass('floating-label-form-group-with-value', !!o(i.target).val());
      })
      .on('focus', '.floating-label-form-group', function () {
        o(this).addClass('floating-label-form-group-with-focus');
      })
      .on('blur', '.floating-label-form-group', function () {
        o(this).removeClass('floating-label-form-group-with-focus');
      });
    if (992 < o(window).width()) {
      var s = o('#mainNav').height();
      o(window).on(
        'scroll',
        {
          previousTop: 0,
        },
        function () {
          var i = o(window).scrollTop();
          i < this.previousTop
            ? 0 < i && o('#mainNav').hasClass('is-fixed')
              ? o('#mainNav').addClass('is-visible')
              : o('#mainNav').removeClass('is-visible is-fixed')
            : i > this.previousTop &&
              (o('#mainNav').removeClass('is-visible'),
              s < i && !o('#mainNav').hasClass('is-fixed') && o('#mainNav').addClass('is-fixed')),
            (this.previousTop = i);
        }
      );
    }
  })(jQuery);

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
});

/*****************************************************************************************/
/************************************** CUSTOM *******************************************/
/*****************************************************************************************/

var rotatorLeaderboard = rotator(
  document.getElementById('ldboardContainer'),
  [
    { url: 'https://niketpathak.com#1', img: './assets/img/leaderboard/leaderboard-1.gif' },
    { url: 'https://niketpathak.com#2', img: './assets/img/leaderboard/leaderboard-2.jpeg' },
    { url: 'https://niketpathak.com#3', img: './assets/img/leaderboard/leaderboard-3.gif' },
    { url: 'https://niketpathak.com#4', img: './assets/img/leaderboard/leaderboard-4.gif' },
    { url: 'https://niketpathak.com#5', img: './assets/img/leaderboard/leaderboard-5.png' },
  ],
  {
    target: 'desktop',
  }
);
rotatorLeaderboard.start(); // start the rotation

var rotatorMobile = rotator(
  document.querySelector('.mobileContainer'),
  [
    { url: 'https://niketpathak.com#1', img: './assets/img/leaderboard/leaderboard-1.gif' },
    { url: 'https://niketpathak.com#2', img: './assets/img/leaderboard/leaderboard-2.jpeg' },
    { url: 'https://niketpathak.com#3', img: './assets/img/leaderboard/leaderboard-3.gif' },
    { url: 'https://niketpathak.com#4', img: './assets/img/leaderboard/leaderboard-4.gif' },
    { url: 'https://niketpathak.com#5', img: './assets/img/leaderboard/leaderboard-5.png' },
  ],
  {
    target: 'mobile',
    sticky: { beforeEl: document.querySelector('.page-heading > h1') },
  }
);
rotatorMobile.start(); // start the rotation

var rotatorSidebar = rotator(
  document.querySelector('.sidebarContainer'),
  [
    { url: 'https://niketpathak.com#1', img: './assets/img/sidebar/sidebar-1.jpg' },
    { url: 'https://niketpathak.com#2', img: './assets/img/sidebar/sidebar-2.jpg' },
    { url: 'https://niketpathak.com#3', img: './assets/img/sidebar/sidebar-3.jpg' },
    { url: 'https://niketpathak.com#4', img: './assets/img/sidebar/sidebar-4.jpg' },
    { url: 'https://niketpathak.com#5', img: './assets/img/sidebar/sidebar-5.png' },
    { url: 'https://niketpathak.com#6', img: './assets/img/sidebar/sidebar-6.jpg' },
    { url: 'https://niketpathak.com#7', img: './assets/img/sidebar/sidebar-7.jpg' },
  ],
  {
    sticky: {
      offsetTop: 55,
      offsetBottom: 50,
      beforeEl: document.querySelector('.sidebar .card'),
      afterEl: document.querySelector('.subscribe-area'),
      noMobile: true,
    },
  }
);
rotatorSidebar.start(); // start the rotation

var rotatorFbackMode = rotator(
  document.querySelector('.blockFallback'),
  [
    { url: 'https://niketpathak.com#1', img: './assets/img/square/square-1.jpeg' },
    { url: 'https://niketpathak.com#2', img: './assets/img/square/square-2.jpeg' },
    { url: 'https://niketpathak.com#3', img: './assets/img/square/square-3.jpeg' },
    { url: 'https://niketpathak.com#4', img: './assets/img/square/square-4.jpg' },
  ],
  {
    fallbackMode: true,
  }
);
rotatorFbackMode.start(); // start the rotation
