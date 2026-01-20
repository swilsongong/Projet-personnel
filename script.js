// Alias for legacy app.js
(function () {
  var s = document.createElement('script');
  s.src = 'app.js';
  // Ensure it runs like a normal script
  (document.body || document.documentElement).appendChild(s);
})();
