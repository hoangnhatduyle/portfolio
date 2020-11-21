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

// $(document).ready(function () {
//     $(".send-btn").click(function () {
//         console.log("hello");
//         if (document.getElementById("name").value == "" || document.getElementById("email").value == "" || document.getElementById("myText").value == "") {
//             $("#error").toggleClass("expand");
//             $("#error").fadeOut(4500, function () {
//                 $(this).remove();
//             });
//         } else {
//             $("#success").toggleClass("expand");
//             $("#success").fadeOut(4500, function () {
//                 $(this).remove();
//             });
//         }
//     });
// });

let about = document.querySelector("#about");
let experience = document.querySelector("#experience");
let skills = document.querySelector("#skills");
let education = document.querySelector("#education");
let contact = document.querySelector("#contact");


window.addEventListener("scroll", () => {
    var windo = window.pageYOffset + 2;
    if (experience.offsetTop <= windo && skills.offsetTop > windo) {
        document.querySelector(".experience").setAttribute("id", "activeExperience");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
    }
    else if (skills.offsetTop <= windo && education.offsetTop > windo) {
        document.querySelector(".skills").setAttribute("id", "activeSkills");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
    }
    else if (education.offsetTop <= windo && contact.offsetTop > windo) {
        document.querySelector(".education").setAttribute("id", "activeEducation");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
    }
    else if (contact.offsetTop <= windo) {
        document.querySelector(".contact").setAttribute("id", "activeContact");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
    }
    else {
        document.querySelector(".about").setAttribute("id", "activeAbout");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
    }
});

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("hide").style.transform = "translateX(194px)"
}

function off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("hide").style.transform = "translateX(-194px)"
}

function removeFadeOut(el, speed) {
    var seconds = speed / 1000;
    el.style.transition = "opacity " + seconds + "s ease";

    el.style.opacity = 0;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, speed);
}

function fadeOut(id, time) {
    var fadeTarget = document.getElementById(id);
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, time);
    setTimeout(function () {
        fadeTarget.parentNode.removeChild(fadeTarget);;
    }, time);
}

function sendEmail() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var mailBody = document.getElementById("myText").value;

    if (name == "" || email == "" || mailBody == "") {
        document.getElementById("error").style.display = "inline-block";
        fadeOut("error", 3000);
    } else {
        var mailContent = "Name: " + name + ". \nEmail: " + email + ". \nMessage: " + mailBody;
        Email.send({
            // Host: "smtp.gmail.com",
            //  Username: "Your mail here",
            //  Password: "Your Password here",
            SecureToken: "5c6fe5b0-8c68-4754-a459-62bddc1be7d0",
            From: "prtflpersonal@gmail.com",
            To: 'lehoangnhatduy2000@gmail.com',
            Subject: "Message From Portfolio",
            Body: mailContent
        })
            .then(function (message) {
                alert(message)
            });
        document.getElementById("success").style.display = "inline-block";
        fadeOut("success", 3000);
        document.getElementById("name").value = " ";
        document.getElementById("email").value = " ";
        document.getElementById("myText").value = " ";
    }
}

function showDescription1() {
    document.getElementById("p1").style.display = "block";
    document.getElementById("p2").style.display = "none";
    document.getElementById("p3").style.display = "none";
    document.getElementById("p4").style.display = "none";
    showColor(document.getElementById("p1").style.display, document.getElementById("p2").style.display, document.getElementById("p3").style.display, document.getElementById("p4").style.display);
}

function showDescription2() {
    document.getElementById("p1").style.display = "none";
    document.getElementById("p2").style.display = "block";
    document.getElementById("p3").style.display = "none";
    document.getElementById("p4").style.display = "none";
    showColor(document.getElementById("p1").style.display, document.getElementById("p2").style.display, document.getElementById("p3").style.display, document.getElementById("p4").style.display);
}

function showDescription3() {
    document.getElementById("p1").style.display = "none";
    document.getElementById("p2").style.display = "none";
    document.getElementById("p3").style.display = "block";
    document.getElementById("p4").style.display = "none";
    showColor(document.getElementById("p1").style.display, document.getElementById("p2").style.display, document.getElementById("p3").style.display, document.getElementById("p4").style.display);
}

function showDescription4() {
    document.getElementById("p1").style.display = "none";
    document.getElementById("p2").style.display = "none";
    document.getElementById("p3").style.display = "none";
    document.getElementById("p4").style.display = "block";
    showColor(document.getElementById("p1").style.display, document.getElementById("p2").style.display, document.getElementById("p3").style.display, document.getElementById("p4").style.display);
}

function showColor(p1, p2, p3, p4) {
    if (p1 == "block") {
        document.getElementById("pic1").style.filter = "none";
        document.getElementById("pic2").style.filter = "grayscale(100%)";
        document.getElementById("pic3").style.filter = "grayscale(100%)";
        document.getElementById("pic4").style.filter = "grayscale(100%)";
    } else if (p2 == "block") {
        document.getElementById("pic2").style.filter = "none";
        document.getElementById("pic1").style.filter = "grayscale(100%)";
        document.getElementById("pic3").style.filter = "grayscale(100%)";
        document.getElementById("pic4").style.filter = "grayscale(100%)";
    } else if (p3 == "block") {
        document.getElementById("pic3").style.filter = "none";
        document.getElementById("pic1").style.filter = "grayscale(100%)";
        document.getElementById("pic2").style.filter = "grayscale(100%)";
        document.getElementById("pic4").style.filter = "grayscale(100%)";
    } else if (p4 == "block") {
        document.getElementById("pic4").style.filter = "none";
        document.getElementById("pic1").style.filter = "grayscale(100%)";
        document.getElementById("pic2").style.filter = "grayscale(100%)";
        document.getElementById("pic3").style.filter = "grayscale(100%)";
    }
}