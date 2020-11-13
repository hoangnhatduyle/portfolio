// (function () {
//     console.log('sasa');
// })();

// $(document).ready(function () {
//     var trigger = $('.toggle'),
//         overlay = $('.overlay'),
//         isClosed = false;

//     trigger.click(function () {
//         hamburger_cross();
//     });

//     function hamburger_cross() {

//         if (isClosed == true) {
//             document.getElementsByClassName("overlay").style.display = "none";
//             isClosed = false;
//         } else {
//             document.getElementsByClassName("overlay").style.display = "block";
//             isClosed = true;
//         }
//     }

//     // $('[data-toggle="offcanvas"]').click(function () {
//     //     $('#wrapper').toggleClass('toggled');
//     // });
// });

function on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("hide").style.transform = "translateX(194px)"
}

function off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("hide").style.transform = "translateX(-194px)"
}