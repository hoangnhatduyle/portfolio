// Google Analytics, loaded off the critical path: the gtag library is ~180 KB and blocks the main
// thread, so it waits for the first interaction (or 5 seconds, whichever comes first).
window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-XM0EP0DGB4');

var gaLoaded = false;
function loadGoogleAnalytics() {
  if (gaLoaded) return;
  gaLoaded = true;
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XM0EP0DGB4';
  document.head.appendChild(script);
}

['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (type) {
  window.addEventListener(type, loadGoogleAnalytics, { once: true, passive: true });
});
window.setTimeout(loadGoogleAnalytics, 5000);
