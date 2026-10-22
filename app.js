/* UPU San Borja — Landing responsive sin frameworks ni dependencias JS externas.
   Para añadir un nuevo visor, editar el arreglo VIEWERS. */
(() => {
  'use strict';

  const CATEGORIES = [
    { id: 'uso-suelo', title: 'Uso del suelo', short: 'Clasificación del suelo y compatibilidades.', description: 'Conoce la clasificación del suelo, los usos compatibles y la normativa aplicable en San Borja.', icon: 'building', info: [['layers', 'Clasificación del suelo'], ['file', 'Usos y compatibilidades'], ['map', 'Normativa relacionada']] },
    { id: 'movilidad', title: 'Movilidad', short: 'Red vial, transporte y conectividad.', description: 'Explora la red vial, las secciones de las vías y la conectividad del distrito.', icon: 'car', info: [['route', 'Red vial local'], ['car', 'Secciones viales'], ['layers', 'Conectividad urbana']] },
    { id: 'espacio-publico', title: 'Espacio público', short: 'Parques, áreas verdes y equipamiento urbano.', description: 'Descubre los parques, las áreas verdes y los espacios públicos del distrito.', icon: 'tree', info: [['tree', 'Parques y áreas verdes'], ['map', 'Espacios públicos'], ['layers', 'Equipamiento urbano']] },
    { id: 'normativa', title: 'Normativa urbana', short: 'Parámetros, reglamentos y documentos técnicos.', description: 'Accede a la información normativa y los instrumentos que orientan el desarrollo urbano.', icon: 'file', info: [['file', 'Reglamentación urbana'], ['building', 'Parámetros urbanísticos'], ['map', 'Instrumentos de gestión']] }
  ];

  const VIEWERS = [
    { id: 'indice-usos', title: 'Índice de Usos', label: 'USO DEL SUELO', description: 'Consulta los usos del suelo y sus compatibilidades en San Borja.', icon: 'layers', categories: ['uso-suelo', 'normativa'], url: 'https://mapausoscompatible.netlify.app/' },
    { id: 'vias-locales', title: 'Vías Locales', label: 'MOVILIDAD', description: 'Explora la red vial, la jerarquía y las características de las vías.', icon: 'car', categories: ['movilidad'], url: 'https://sistemavial.msb.gob.pe/' },
    { id: 'espacios-publicos', title: 'Espacios Públicos', label: 'ESPACIO URBANO', description: 'Ubica parques, áreas verdes y equipamiento urbano.', icon: 'tree', categories: ['espacio-publico'], url: 'https://espaciospublicosmsb.netlify.app/' },
    { id: 'soterrados', title: 'Soterrados', label: 'INFRAESTRUCTURA', description: 'Visualiza la infraestructura de servicios soterrados.', icon: 'route', categories: ['espacio-publico'], url: 'https://inventariodiestra2026.netlify.app/' },
    { id: 'slo', title: 'SLO', label: 'PLANIFICACIÓN TERRITORIAL', description: 'Consulta las superficies limitadoras de obstáculos y las restricciones aeronáuticas.', icon: 'map', categories: ['normativa'], url: 'https://visorslo.netlify.app/' },
    { id: 'convenios', title: 'Convenios', label: 'GESTIÓN URBANA', description: 'Revisa convenios urbanísticos y su ubicación en el territorio.', icon: 'file', categories: ['normativa'], url: 'https://visor-convenio.netlify.app/' }
  ];

  const EXTRA_RESOURCES = [
    { id: 'parametros', title: 'Parámetros Urbanísticos', description: 'Revisa los parámetros normativos aplicables por zona.', icon: 'building', categories: ['uso-suelo', 'normativa'], url: null },
    { id: 'plano-zonificacion', title: 'Plano de Zonificación', description: 'Visualiza la zonificación vigente del distrito.', icon: 'map', categories: ['uso-suelo', 'normativa'], url: null },
    { id: 'niveles-operacionales', title: 'Niveles Operacionales', description: 'Información sobre condiciones de funcionamiento de actividades.', icon: 'file', categories: ['uso-suelo', 'normativa'], url: null }
  ];

  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = val => String(val).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const main = document.querySelector('#mainContent');
  const menuToggle = document.querySelector('#menuToggle');
  const mobileNav = document.querySelector('#mobileNav');

  function categoryCard(category, i) {
    return `<a class="topic-card topic-card--${i}" href="#categoria/${category.id}" aria-label="Explorar ${safe(category.title)}">
      <span class="topic-card__icon">${icon(category.icon)}</span>
      <span class="topic-card__body"><span class="topic-card__title">${safe(category.title)}</span><span class="topic-card__description">${safe(category.short)}</span></span>
      <span class="topic-card__arrow">${icon('arrow')}</span>
    </a>`;
  }

  function viewerCard(viewer) {
    const link = viewer.url
      ? `<a class="viewer-card__link" href="${safe(viewer.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir visor ${safe(viewer.title)} en una pestaña nueva">Abrir visor ${icon('arrow')}</a>`
      : `<span class="viewer-card__link is-disabled">Próximamente ${icon('clock')}</span>`;
    return `<article class="viewer-card">
      <div class="viewer-card__visual" role="img" aria-label="Espacio reservado para una futura imagen del visor"></div>
      <div class="viewer-card__info"><span class="viewer-card__label">${safe(viewer.label || 'CONSULTA TERRITORIAL')}</span>
        <h3 class="viewer-card__title">${safe(viewer.title)}</h3><p class="viewer-card__desc">${safe(viewer.description)}</p>
        <div class="viewer-card__bottom">${link}<span class="viewer-card__symbol">${icon(viewer.icon)}</span></div>
      </div>
    </article>`;
  }

  function searchForm(text = '', secondary = false) {
    if (secondary) return `<form class="search-content__controls" data-search-form role="search"><input name="q" aria-label="Buscar información territorial" type="search" value="${safe(text)}" placeholder="Busca un visor, vía, parque o tema..." required><button class="button-primary" type="submit">Buscar</button></form>`;
    return `<form class="hero-search" data-search-form role="search" aria-label="Buscar visores o información">
      ${icon('search')}<input name="q" type="search" aria-label="Buscar visores, temas o información" placeholder="Buscar visores, temas o información..." autocomplete="off" required>
      <button type="submit"><span>Buscar</span>${icon('arrow')}</button>
    </form>`;
  }

  function homeHTML() {
    return `<div class="home-view">
      <section class="hero" aria-labelledby="heroTitle"><div class="container hero__inner"><div class="hero__content">
        <span class="eyebrow hero__eyebrow">TERRITORIO · DATOS · PLANIFICACIÓN</span>
        <h1 id="heroTitle">Conocer la ciudad.<br>Construir su futuro.</h1>
        <p class="hero__description">Explora San Borja, comprende su planificación y accede al conocimiento territorial a través de visores urbanos, análisis espacial y datos abiertos.</p>
        ${searchForm()}
        <div class="trust-row"><div class="trust-item">${icon('map')}<span>Información<br>confiable</span></div><div class="trust-item">${icon('layers')}<span>Territorio<br>en un solo lugar</span></div><div class="trust-item">${icon('users')}<span>Al servicio<br>de la ciudadanía</span></div></div>
      </div></div><span class="hero__caption">Vista aérea de San Borja</span></section>

      <section class="section section--categories" id="descubre" aria-labelledby="categoriesTitle"><div class="container">
        <div class="eyebrow">DESCUBRE UPU</div><h2 class="section-heading" id="categoriesTitle">¿Qué quieres conocer?</h2>
        <p class="section-lead">Explora los principales temas del territorio de San Borja.</p>
        <div class="category-grid">${CATEGORIES.map(categoryCard).join('')}</div>
      </div></section>

      <section class="section section--viewers" id="exploracion" aria-labelledby="viewersTitle"><div class="container">
        <div class="section-head-inline"><div><div class="eyebrow">EXPLORACIÓN TERRITORIAL</div>
          <h2 class="section-heading" id="viewersTitle">Herramientas que hacen visible la ciudad.</h2>
          <p class="section-lead">Accede a nuestros visores temáticos y conoce más sobre el territorio, la planificación urbana y la gestión de la ciudad.</p>
        </div><a class="outline-button" href="#visores">Ver todos los visores ${icon('arrow')}</a></div>
        <div class="viewer-grid">${VIEWERS.map(viewerCard).join('')}</div>
      </div></section>
    </div>`;
  }

  function categoryHero(category, parent = 'Planeamiento') {
    return `<section class="internal-hero" aria-labelledby="internalHeading"><div class="container internal-hero__inside">
      <div class="breadcrumb"><a href="#inicio" data-home>Inicio</a>${icon('chevron')}<span>${safe(parent)}</span>${icon('chevron')}<span aria-current="page">${safe(category.title)}</span></div>
      <div class="internal-hero__titleline"><span class="internal-hero__icon">${icon(category.icon)}</span>
        <div><h1 id="internalHeading">${safe(category.title)}</h1><p>${safe(category.description)}</p></div>
      </div></div></section>`;
  }

  function resourceCard(resource) {
    const cta = resource.url
      ? `<a class="related-card__cta" href="${safe(resource.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${safe(resource.title)} en una pestaña nueva"><span>Abrir visor</span>${icon('arrow')}</a>`
      : `<span class="related-card__cta disabled" aria-label="${safe(resource.title)}, próximamente"><span>Próximamente</span>${icon('clock')}</span>`;
    return `<article class="related-card"><div class="related-card__thumb" aria-hidden="true"></div>
      <div class="related-card__content"><strong>${safe(resource.title)}</strong><p>${safe(resource.description)}</p></div>${cta}
    </article>`;
  }

  function categoryHTML(id) {
    const category = CATEGORIES.find(c => c.id === id);
    if (!category) return notFoundHTML();
    const linked = [...VIEWERS, ...EXTRA_RESOURCES].filter(v => v.categories.includes(category.id));
    return `${categoryHero(category)}<section class="container internal-content">
      <a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <h2 class="block-title">Información principal</h2>
      <div class="info-grid">${category.info.map(([ic, label]) => `<div class="info-tile">${icon(ic)}<strong>${safe(label)}</strong></div>`).join('')}</div>
      <h2 class="block-title related-title">Visores y recursos relacionados</h2>
      <div class="related-list">${linked.map(resourceCard).join('')}</div>
      ${linked.some(v => !v.url) ? `<div class="info-message">${icon('info')}<span>Los recursos señalados como <strong>Próximamente</strong> aún no tienen un enlace de consulta habilitado. No se muestran descargas ni datos ficticios.</span></div>` : ''}
    </section>`;
  }

  function viewAllHTML() {
    return `${categoryHero({ title: 'Visores urbanos', description: 'Todas las herramientas disponibles para consultar información territorial de San Borja.', icon: 'map' }, 'Explora')}
      <section class="container internal-content"><a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <h2 class="block-title">Todos los visores</h2><div class="viewer-grid">${VIEWERS.map(viewerCard).join('')}</div></section>`;
  }

  function infoPageHTML(name) {
    const configs = {
      'datos-abiertos': { title: 'Datos abiertos', desc: 'Acceso a información geográfica y datos espaciales del territorio.', icon: 'database', items: [['Zonificación urbana', 'Delimitaciones y categorías de zonificación.', 'layers'], ['Red vial y secciones', 'Información territorial del sistema vial local.', 'route'], ['Espacios públicos', 'Capas e inventario geográfico de áreas públicas.', 'tree']], notice: 'El catálogo público y las descargas se habilitarán cuando los datos cuenten con validación, fuentes y condiciones de uso.' },
      'planeamiento': { title: 'Planeamiento urbano', desc: 'Instrumentos, normas e información que orientan la gestión del territorio distrital.', icon: 'file', items: [['Uso del suelo', 'Clasificación del suelo y compatibilidades.', 'building', 'uso-suelo'], ['Movilidad', 'Red vial, jerarquía y secciones urbanas.', 'car', 'movilidad'], ['Normativa urbana', 'Parámetros, reglamentos y documentos.', 'file', 'normativa']], notice: 'Selecciona un tema para consultar los visores relacionados. Algunas herramientas se encuentran pendientes de publicación.' },
      'nosotros': { title: 'Nosotros', desc: 'Conoce la Unidad de Planeamiento Urbano de San Borja y sus herramientas territoriales.', icon: 'users', items: [['Unidad de Planeamiento Urbano', 'Información y herramientas para el planeamiento territorial.', 'building'], ['Innovación y datos espaciales', 'Uso de información geográfica para apoyar decisiones urbanas.', 'database'], ['Servicio a la ciudadanía', 'Acceso organizado a visores geográficos e información pública.', 'users']], notice: 'UPU San Borja · Unidad de Planeamiento Urbano · Oficina General de Innovación y Desarrollo Económico · Municipalidad de San Borja.' }
    };
    const data = configs[name];
    if (!data) return notFoundHTML();
    return `${categoryHero({ title: data.title, description: data.desc, icon: data.icon }, 'UPU San Borja')}
      <section class="container internal-content"><a href="#inicio" data-home class="back-link">${icon('back')} Volver al inicio</a>
        <h2 class="block-title">${data.title === 'Nosotros' ? 'Nuestra iniciativa' : 'Información principal'}</h2>
        <div class="related-list">${data.items.map(([title, desc, ic, category]) => `<article class="related-card"><div class="related-card__thumb">${icon(ic)}</div><div class="related-card__content"><strong>${safe(title)}</strong><p>${safe(desc)}</p></div>${category ? `<a class="related-card__cta" href="#categoria/${category}" aria-label="Explorar ${safe(title)}"><span>Explorar</span>${icon('arrow')}</a>` : `<span class="related-card__cta disabled" aria-label="Contenido informativo">${icon('info')}</span>`}</article>`).join('')}</div>
        <div class="info-message">${icon('info')}<span>${safe(data.notice)}</span></div>
      </section>`;
  }

  function searchHTML(searchTerm) {
    const term = normalize(searchTerm);
    const categories = CATEGORIES.filter(c => normalize([c.title, c.short, c.description].join(' ')).includes(term));
    const viewers = VIEWERS.filter(v => normalize([v.title, v.label, v.description].join(' ')).includes(term));
    return `<section class="container search-content"><a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <div class="eyebrow">EXPLORA SAN BORJA</div><h1 class="section-heading">Resultados de búsqueda</h1>
      <p class="section-lead">Encuentra temas y visores disponibles desde la plataforma UPU.</p>
      ${searchForm(searchTerm, true)}
      ${!categories.length && !viewers.length ? `<div class="empty-state">${icon('search')}<strong>No se encontraron resultados</strong><p>Prueba con otros términos, por ejemplo: vías, parques, usos o normativa.</p></div>` : `
        ${categories.length ? `<h2 class="results-title">Temas (${categories.length})</h2><div class="category-grid">${categories.map(c => categoryCard(c, CATEGORIES.indexOf(c))).join('')}</div>` : ''}
        ${viewers.length ? `<h2 class="results-title" style="margin-top:32px">Visores (${viewers.length})</h2><div class="viewer-grid">${viewers.map(viewerCard).join('')}</div>` : ''}
      `}</section>`;
  }

  function notFoundHTML() {
    return `<section class="container search-content"><a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a><h1 class="section-heading">No encontramos esta sección</h1><p class="section-lead">Puedes volver a la página principal para explorar los contenidos disponibles.</p></section>`;
  }

  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.innerHTML = icon('menu');
    document.body.classList.remove('menu-open');
  }
  function toggleMenu() {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menuToggle.innerHTML = icon(open ? 'close' : 'menu');
    document.body.classList.toggle('menu-open', open);
  }

  function renderRoute(scroll = true) {
    closeMenu();
    const route = decodeURIComponent(location.hash.slice(1) || 'inicio');
    if (route === 'inicio' || route === '') main.innerHTML = homeHTML();
    else if (route.startsWith('categoria/')) main.innerHTML = categoryHTML(route.slice('categoria/'.length));
    else if (route === 'visores') main.innerHTML = viewAllHTML();
    else if (route.startsWith('buscar/')) main.innerHTML = searchHTML(route.slice('buscar/'.length));
    else if (['datos-abiertos', 'planeamiento', 'nosotros'].includes(route)) main.innerHTML = infoPageHTML(route);
    else main.innerHTML = notFoundHTML();
    document.title = (route === 'inicio' ? 'UPU San Borja | Planeamiento Urbano' : 'UPU San Borja | ' + (CATEGORIES.find(c => route.endsWith(c.id))?.title || route.split('/')[0]));
    document.querySelectorAll('.desktop-nav a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + route));
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  menuToggle.addEventListener('click', event => { event.stopPropagation(); toggleMenu(); });
  document.addEventListener('click', event => {
    const explore = event.target.closest('[data-explore]');
    if (explore) {
      event.preventDefault();
      closeMenu();
      if (location.hash !== '#inicio') location.hash = 'inicio';
      renderRoute(false);
      requestAnimationFrame(() => document.getElementById('descubre')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    const home = event.target.closest('[data-home]');
    if (home) {
      closeMenu();
      if (location.hash === '#inicio') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    if (!mobileNav.hidden && !event.target.closest('.mobile-nav, #menuToggle')) closeMenu();
  });
  document.addEventListener('submit', event => {
    const form = event.target.closest('form[data-search-form]');
    if (!form) return;
    event.preventDefault();
    const q = form.querySelector('input[name="q"]')?.value.trim();
    if (!q) return;
    location.hash = 'buscar/' + encodeURIComponent(q);
    if (location.hash === '#buscar/' + encodeURIComponent(q)) renderRoute();
  });
  window.addEventListener('hashchange', () => renderRoute());
  window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu() });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu() });

  // Intro institucional. Se ejecuta en cada carga de página, con opción de omitir.
  const intro = document.querySelector('#intro');
  let introTimeout;
  function dismissIntro() {
    if (!intro || intro.classList.contains('is-hidden')) return;
    intro.classList.add('is-hidden');
    clearTimeout(introTimeout);
    setTimeout(() => intro.remove(), 650);
  }
  document.querySelector('#skipIntro').addEventListener('click', dismissIntro);
  introTimeout = setTimeout(dismissIntro, 1700);

  renderRoute(false);
})();
