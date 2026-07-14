document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll (con stagger dentro de un mismo grupo)
  document.querySelectorAll('.how-grid').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Transición de bloque al hacer scroll (cada sección entra con fundido)
  var sectionIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('sec-in'); sectionIo.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('section:not(.hero)').forEach(function (el) {
    el.classList.add('sec-fade');
    sectionIo.observe(el);
  });

  // Carrusel de palabras a pantalla completa: posición atada 1:1 al scroll (scrubbing continuo)
  var wf = document.querySelector('.word-full');
  var wfScroll = document.querySelector('.word-full-scroll');
  var wfBox = document.querySelector('.word-full-display');
  if (wf && wfScroll && wfBox) {
    var wfItems = wf.querySelectorAll('.wf-item');
    var wfTotal = wfItems.length;

    var wfFit = function () {
      wfItems.forEach(function (item) { item.style.fontSize = ''; });
      var longest = wfItems[0];
      wfItems.forEach(function (item) { if (item.scrollWidth > longest.scrollWidth) longest = item; });
      var avail = wfBox.clientWidth - 12;
      var actual = longest.scrollWidth;
      if (actual > avail) {
        var base = parseFloat(window.getComputedStyle(longest).fontSize);
        var fitted = Math.floor(base * (avail / actual));
        wfItems.forEach(function (item) { item.style.fontSize = fitted + 'px'; });
      }
    };
    wfFit();
    window.addEventListener('resize', wfFit);

    if (reduceMotion) {
      wf.classList.add('wf-static');
    } else {
      var wfTicking = false;
      var wfUpdate = function () {
        wfTicking = false;
        var rect = wfScroll.getBoundingClientRect();
        var total = wfScroll.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var progress = Math.min(1, Math.max(0, -rect.top / total));
        var continuous = progress * (wfTotal - 1);
        var boxH = wfBox.offsetHeight;
        wfItems.forEach(function (item, i) {
          var offset = i - continuous;
          var abs = Math.min(Math.abs(offset), 1.6);
          var opacity = Math.max(0, 1 - abs * 0.75);
          var scale = 1 - abs * 0.3;
          var blur = abs * 3.2;
          var y = offset * boxH * 0.42;
          item.style.transform = 'translateY(calc(-50% + ' + y + 'px)) scale(' + scale + ')';
          item.style.opacity = opacity;
          item.style.filter = blur ? 'blur(' + blur + 'px)' : 'none';
        });
      };
      window.addEventListener('scroll', function () {
        if (!wfTicking) { wfTicking = true; requestAnimationFrame(wfUpdate); }
      }, { passive: true });
      wfUpdate();
    }
  }

  // Cursor personalizado en forma del logo (ratón) + botones magnéticos (solo desktop con puntero fino)
  var canCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canCustomCursor && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    var logo = document.createElement('div'); logo.className = 'cursor-logo';
    document.body.appendChild(logo);

    document.addEventListener('mousemove', function (ev) {
      logo.style.left = ev.clientX + 'px'; logo.style.top = ev.clientY + 'px';
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      var onDark = el && el.closest && el.closest('.quote,.word-full,.guarantee');
      logo.classList.toggle('on-dark', !!onDark);
    });

    document.querySelectorAll('a,button,.btn,.btn-outline').forEach(function (el) {
      el.addEventListener('mouseenter', function () { logo.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { logo.classList.remove('hovering'); });
    });

    document.querySelectorAll('.btn,.btn-outline').forEach(function (btn) {
      btn.addEventListener('mousemove', function (ev) {
        var r = btn.getBoundingClientRect();
        var x = ev.clientX - r.left - r.width / 2;
        var y = ev.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.35) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }
});
