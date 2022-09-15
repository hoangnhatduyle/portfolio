// get the form elements defined in your form HTML above

var form = document.getElementById("emailForm");

// Success and Error functions for after the form is submitted

function success() {
    form.reset();
    $("#my-form-button").css("display", "none");
    $("#my-form-status").css("color", "black");
    $("#my-form-status").html("Thanks for contacting me! I will reply to you soon!");
}

function error() {
    $("#my-form-status").html("There was a problem trying to send the email. Please use other methods to contact.");
}

// handle the form submission event

form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    ajax(form.method, form.action, data, success, error);
});

// helper function for sending an AJAX request

function ajax(method, url, data, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status === 200) {
            success(xhr.response, xhr.responseType);
        } else {
            error(xhr.status, xhr.response, xhr.responseType);
        }
    };
    xhr.send(data);
}