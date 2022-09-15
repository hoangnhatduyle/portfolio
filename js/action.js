let about = document.querySelector("#about");
let experience = document.querySelector("#experience");
let skills = document.querySelector("#skills");
let project = document.querySelector("#project");
let education = document.querySelector("#education");
let feedback = document.querySelector("#feedback");
let contact = document.querySelector("#contact");


window.addEventListener("scroll", () => {
    var windo = window.pageYOffset + 2;
    if (windo - 2 > 0) {
        document.getElementById("go-top").style.display = "flex";
    } else if (windo - 2 == 0) {
        document.getElementById("go-top").style.display = "none";
    }

    if (about.offsetTop <= windo && experience.offsetTop > windo) {
        document.querySelector(".about").setAttribute("id", "activeAbout");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else if (experience.offsetTop <= windo && skills.offsetTop > windo) {
        document.querySelector(".experience").setAttribute("id", "activeExperience");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else if (skills.offsetTop <= windo && project.offsetTop > windo) {
        document.querySelector(".skills").setAttribute("id", "activeSkills");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else if (project.offsetTop <= windo && education.offsetTop > windo) {
        document.querySelector(".project").setAttribute("id", "activeProject");
        document.querySelector(".education").removeAttribute("id", "activeAbout");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else if (education.offsetTop <= windo && feedback.offsetTop > windo) {
        document.querySelector(".education").setAttribute("id", "activeEducation");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else if (feedback.offsetTop <= windo && contact.offsetTop > windo) {
        document.querySelector(".feedback").setAttribute("id", "activeFeedback");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".contact").removeAttribute("id", "activeContact");
    }
    else if (contact.offsetTop <= windo) {
        document.querySelector(".contact").setAttribute("id", "activeContact");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
    else {
        document.querySelector(".contact").removeAttribute("id", "activeContact");
        document.querySelector(".about").removeAttribute("id", "activeAbout");
        document.querySelector(".skills").removeAttribute("id", "activeSkills");
        document.querySelector(".project").removeAttribute("id", "activeProject");
        document.querySelector(".education").removeAttribute("id", "activeEducation");
        document.querySelector(".experience").removeAttribute("id", "activeExperience");
        document.querySelector(".feedback").removeAttribute("id", "activeFeedback");
    }
});

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function aboutSection() {
    let about = document.querySelector("#about");
    window.scrollTo(0, about.offsetTop);
}
function experienceSection() {
    let experience = document.querySelector("#experience");
    window.scrollTo(0, experience.offsetTop);
}
function skillsSection() {
    let skills = document.querySelector("#skills");
    window.scrollTo(0, skills.offsetTop);
}
function projectSection() {
    let project = document.querySelector("#project");
    window.scrollTo(0, project.offsetTop);
}
function educationSection() {
    let education = document.querySelector("#education");
    window.scrollTo(0, education.offsetTop);
}
function feedbackSection() {
    let feedback = document.querySelector("#feedback");
    window.scrollTo(0, feedback.offsetTop);
}
function contactSection() {
    let contact = document.querySelector("#contact");
    window.scrollTo(0, contact.offsetTop + 1);
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