(function () {
  'use strict';

  var root = document.documentElement;

  // Tema claro/escuro -----------------------------------------------------
  var themeBtn = document.getElementById('theme-toggle');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
  }

  function updateThemeLabel() {
    var next = currentTheme() === 'dark' ? 'claro' : 'escuro';
    themeBtn.setAttribute('aria-label', 'Ativar tema ' + next);
    themeBtn.setAttribute('title', 'Ativar tema ' + next);
  }

  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateThemeLabel();
  });
  if (media.addEventListener) media.addEventListener('change', updateThemeLabel);
  updateThemeLabel();

  // Menu mobile -----------------------------------------------------------
  var menuBtn = document.getElementById('menu-toggle');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
  });

  // Filtros de projetos ---------------------------------------------------
  var filters = document.querySelectorAll('.filter');
  var groups = document.querySelectorAll('.group');

  // Contadores dos filtros calculados a partir dos cards publicados
  var total = 0;
  groups.forEach(function (g) {
    var n = g.querySelectorAll('.card:not(.card-soon)').length;
    var count = document.querySelector('.filter[data-filter="' + g.getAttribute('data-group') + '"] .count');
    total += n;
    if (count && n) count.textContent = n;
  });
  var totalCount = document.querySelector('.filter[data-filter="all"] .count');
  if (totalCount) totalCount.textContent = total;

  // Grupos com muitos cards começam recolhidos, com botão "Ver todos"
  // (com até 6 cards, só no celular; ver .group[data-few] no CSS)
  groups.forEach(function (g) {
    var cards = g.querySelectorAll('.card');
    if (cards.length <= 3) return;
    if (cards.length <= 6) g.setAttribute('data-few', '');
    var wrap = document.createElement('div');
    wrap.className = 'more-wrap';
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'btn btn-ghost';
    more.textContent = (g.getAttribute('data-more') || 'Ver todos os {n} projetos').replace('{n}', cards.length);
    more.addEventListener('click', function () {
      // Leva o foco ao primeiro card revelado, para quem navega por teclado
      var firstHidden = Array.prototype.find.call(cards, function (c) { return c.offsetParent === null; });
      g.classList.remove('is-collapsed');
      g.setAttribute('data-expanded', '');
      if (firstHidden) firstHidden.querySelector('.card-cta').focus({ preventScroll: true });
    });
    wrap.appendChild(more);
    g.appendChild(wrap);
    g.classList.add('is-collapsed');
  });

  var filterStatus = document.getElementById('filter-status');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-filter');
      var shown = 0;
      var shownGuides = 0;
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      groups.forEach(function (g) {
        g.hidden = value !== 'all' && g.getAttribute('data-group') !== value;
        // Ao escolher um tema específico, mostra todos os projetos dele;
        // em "Todos", volta a recolher o que o visitante não expandiu
        if (value !== 'all' && !g.hidden) g.classList.remove('is-collapsed');
        else if (value === 'all' && g.querySelector('.more-wrap') && !g.hasAttribute('data-expanded')) g.classList.add('is-collapsed');
        if (!g.hidden) {
          // Guias (data-kind="guia") são contados à parte: não são projetos
          var n = g.querySelectorAll('.card:not(.card-soon)').length;
          if (g.getAttribute('data-kind') === 'guia') shownGuides += n;
          else shown += n;
        }
      });
      if (filterStatus) {
        var label = btn.querySelector('.lbl-full') || btn.firstChild;
        var guidesText = shownGuides + (shownGuides === 1 ? ' guia' : ' guias');
        filterStatus.textContent = value === 'all'
          ? 'Mostrando todos os ' + shown + ' projetos e ' + guidesText
          : shownGuides ? 'Mostrando ' + guidesText
          : shown ? 'Mostrando ' + shown + ' projetos de ' + label.textContent.trim() : 'Projetos de ' + label.textContent.trim() + ' em construção';
      }
    });
  });

  // Link ativo no menu conforme a rolagem ---------------------------------
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // Ano no rodapé ---------------------------------------------------------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
