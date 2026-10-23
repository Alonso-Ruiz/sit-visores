/* UPU San Borja — Landing responsive sin frameworks ni dependencias JS externas.
   Para añadir un nuevo visor, editar el arreglo VIEWERS. */
(() => {
  'use strict';

  const CATEGORIES = [
    // El simulador sigue el mismo recorrido de categoría que los demás temas.
    {
      id: 'uso-suelo',
      title: 'Uso del suelo',
      short: 'Clasificación del suelo y compatibilidades.',
      description:
        'Conoce la clasificación del suelo, los usos compatibles y la normativa aplicable en San Borja.',
      icon: 'building',
      info: [
        ['layers', 'Clasificación del suelo'],
        ['file', 'Usos y compatibilidades'],
        ['map', 'Normativa relacionada'],
      ],
    },
    {
      id: 'movilidad',
      title: 'Movilidad',
      short: 'Red vial, transporte y conectividad.',
      description:
        'Explora la red vial, las secciones de las vías y la conectividad del distrito.',
      icon: 'car',
      info: [
        ['route', 'Red vial local'],
        ['car', 'Secciones viales'],
        ['layers', 'Conectividad urbana'],
      ],
    },
    {
      id: 'espacio-publico',
      title: 'Espacio público',
      short: 'Parques, áreas verdes y equipamiento urbano.',
      description:
        'Descubre los parques, las áreas verdes y los espacios públicos del distrito.',
      icon: 'tree',
      info: [
        ['tree', 'Parques y áreas verdes'],
        ['map', 'Espacios públicos'],
        ['layers', 'Equipamiento urbano'],
      ],
    },
    {
      id: 'normativa',
      title: 'Normativa urbana',
      short: 'Parámetros, reglamentos y documentos técnicos.',
      description:
        'Accede a la información normativa y los instrumentos que orientan el desarrollo urbano.',
      icon: 'file',
      info: [
        ['file', 'Reglamentación urbana'],
        ['building', 'Parámetros urbanísticos'],
        ['map', 'Instrumentos de gestión'],
      ],
    },
  ];

  CATEGORIES.push({
    id: 'cabida', title: 'Simular escenario urbano cabida',
    short: 'Explora el potencial de un lote con PREDIAL.',
    description: 'Configura un lote, ajusta sus parámetros y explora escenarios de cabida con el simulador PREDIAL.',
    icon: 'cabida',
    info: [['map', 'Geometría del lote'], ['layers', 'Parámetros y cabida'], ['cabida', 'Visualización 3D']]
  });

  const VIEWERS = [
    {
      id: 'indice-usos',
      title: 'Índice de Usos',
      label: 'USO DEL SUELO',
      description:
        'Consulta los usos del suelo y sus compatibilidades en San Borja.',
      icon: 'layers',
      categories: ['uso-suelo', 'normativa'],
      url: 'https://mapausoscompatible.netlify.app/',
    },
    {
      id: 'vias-locales',
      title: 'Vías Locales',
      label: 'MOVILIDAD',
      description:
        'Explora la red vial, la jerarquía y las características de las vías.',
      icon: 'car',
      categories: ['movilidad'],
      url: 'https://sistemavial.msb.gob.pe/',
    },
    {
      id: 'espacios-publicos',
      title: 'Espacios Públicos',
      label: 'ESPACIO URBANO',
      description: 'Ubica parques, áreas verdes y equipamiento urbano.',
      icon: 'tree',
      categories: ['espacio-publico'],
      url: 'https://espaciospublicosmsb.netlify.app/',
    },
    {
      id: 'soterrados',
      title: 'Soterrados',
      label: 'INFRAESTRUCTURA',
      description: 'Visualiza la infraestructura de servicios soterrados.',
      icon: 'route',
      categories: ['espacio-publico'],
      url: 'https://inventariodiestra2026.netlify.app/',
    },
    {
      id: 'slo',
      title: 'SLO',
      label: 'PLANIFICACIÓN TERRITORIAL',
      description:
        'Consulta las superficies limitadoras de obstáculos y las restricciones aeronáuticas.',
      icon: 'map',
      categories: ['normativa'],
      url: 'https://visorslo.netlify.app/',
    },
    {
      id: 'convenios',
      title: 'Convenios',
      label: 'GESTIÓN URBANA',
      description:
        'Revisa convenios urbanísticos y su ubicación en el territorio.',
      icon: 'file',
      categories: ['normativa'],
      url: 'https://visor-convenio.netlify.app/',
    },
  ];

  const EXTRA_RESOURCES = [
    {
      id: 'parametros',
      title: 'Parámetros Urbanísticos',
      description: 'Revisa los parámetros normativos aplicables por zona.',
      icon: 'building',
      categories: ['uso-suelo', 'normativa'],
      url: null,
    },
    {
      id: 'plano-zonificacion',
      title: 'Plano de Zonificación',
      description: 'Visualiza la zonificación vigente del distrito.',
      icon: 'map',
      categories: ['uso-suelo', 'normativa'],
      url: null,
    },
    {
      id: 'niveles-operacionales',
      title: 'Niveles Operacionales',
      description:
        'Información sobre condiciones de funcionamiento de actividades.',
      icon: 'file',
      categories: ['uso-suelo', 'normativa'],
      url: null,
    },
  ];

  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const safe = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]
    );
  const normalize = (val) =>
    String(val)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
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
    if (secondary)
      return `<form class="search-content__controls" data-search-form role="search"><input name="q" aria-label="Buscar información territorial" type="search" value="${safe(text)}" placeholder="Busca un visor, vía, parque o tema..." required><button class="button-primary" type="submit">Buscar</button></form>`;
    return `<form class="hero-search" data-search-form role="search" aria-label="Buscar visores o información">
      ${icon('search')}<input name="q" type="search" aria-label="Buscar visores, temas o información" placeholder="Buscar visores, temas o información..." autocomplete="off" required>
      <button type="submit"><span>Buscar</span>${icon('arrow')}</button>
    </form>`;
  }

  function homeHTML() {
    return `<div class="home-view">
      <section class="hero" aria-labelledby="heroTitle"><div class="container hero__inner"><div class="hero__content">
        <span class="eyebrow hero__eyebrow">Ciencia de Datos Espaciales para el Planeamiento Urbano</span>
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
    const category = CATEGORIES.find((c) => c.id === id);
    if (!category) return notFoundHTML();
    if (id === 'cabida') return `${categoryHero(category)}<section class="container internal-content">
      <a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <h2 class="block-title">Explora un escenario de cabida</h2>
      <div class="info-grid">${category.info.map(([ic, label]) => `<div class="info-tile">${icon(ic)}<strong>${label}</strong></div>`).join('')}</div>
      <article class="predial-launch"><span class="predial-launch__icon">${icon('cabida')}</span><div><h2>Del lote a una posibilidad urbana</h2><p>Define la geometría, ajusta los parámetros y observa el escenario en 3D. Puedes importar tus archivos y explorar las herramientas del módulo.</p><small>Los resultados dependen de los parámetros ingresados. Requiere conexión a Internet.</small></div><button type="button" class="predial-open" data-open-predial>Abrir PREDIAL ${icon('arrow')}</button></article>
    </section>`;
    const linked = [...VIEWERS, ...EXTRA_RESOURCES].filter((v) =>
      v.categories.includes(category.id)
    );
    return `${categoryHero(category)}<section class="container internal-content">
      <a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <h2 class="block-title">Información principal</h2>
      <div class="info-grid">${category.info.map(([ic, label]) => `<div class="info-tile">${icon(ic)}<strong>${safe(label)}</strong></div>`).join('')}</div>
      <h2 class="block-title related-title">Visores y recursos relacionados</h2>
      <div class="related-list">${linked.map(resourceCard).join('')}</div>
      ${linked.some((v) => !v.url) ? `<div class="info-message">${icon('info')}<span>Los recursos señalados como <strong>Próximamente</strong> aún no tienen un enlace de consulta habilitado. No se muestran descargas ni datos ficticios.</span></div>` : ''}
    </section>`;
  }

  function viewAllHTML() {
    return `${categoryHero({ title: 'Visores urbanos', description: 'Todas las herramientas disponibles para consultar información territorial de San Borja.', icon: 'map' }, 'Explora')}
      <section class="container internal-content"><a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <h2 class="block-title">Todos los visores</h2><div class="viewer-grid">${VIEWERS.map(viewerCard).join('')}</div></section>`;
  }

  function planningPageHTML() {
    const pud = 'https://www.gob.pe/institucion/munisanborja/informes-publicaciones/5745191-plan-urbano-distrital-del-distrito-de-san-borja-2020-2030';
    const groups = [
      { title: 'Nacional', scope: 'Marco normativo del Perú', icon: 'file', docs: [
        { title: 'Ley N° 31313', type: 'Ley · DUS', desc: 'Ley de Desarrollo Urbano Sostenible: planificación urbana, uso y gestión del suelo.', source: 'El Peruano', url: 'https://busquedas.elperuano.pe/dispositivo/NL/1976352-2' },
        { title: 'RATPUDUS', type: 'D. S. N° 012-2022-VIVIENDA', desc: 'Reglamento de Acondicionamiento Territorial y Planificación Urbana del Desarrollo Urbano Sostenible.', source: 'Ministerio de Vivienda', url: 'https://www.gob.pe/institucion/vivienda/normas-legales/3588833-012-2022-vivienda' },
        { title: 'D. L. N° 1674', type: 'Decreto legislativo', desc: 'Modifica la Ley N° 31313, Ley de Desarrollo Urbano Sostenible.', source: 'El Peruano', url: 'https://busquedas.elperuano.pe/dispositivo/NL/2329855-10' },
        { title: 'Plan Urbano Distrital de San Borja 2020–2030', type: 'Referencia · Ámbito distrital', desc: 'Acceso al PUD de San Borja, también disponible en la sección Distrital.', source: 'Municipalidad de San Borja', url: pud }
      ] },
      { title: 'Metropolitana', scope: 'Planificación de Lima Metropolitana', icon: 'map', docs: [
        { title: 'PLANMET 2040', type: 'Plan metropolitano', desc: 'Plan de Desarrollo Metropolitano de Lima 2021–2040. Consulta documentos, planos y reglamento.', source: 'Instituto Metropolitano de Planificación', url: 'https://portal.imp.gob.pe/planificacion/plan-met-2040/' },
        { title: 'Ordenanza N° 1063-MML', type: 'Ordenanza metropolitana', desc: 'Reajuste integral de la zonificación de los usos del suelo de San Borja. Disponible en el catálogo del IMP.', source: 'Instituto Metropolitano de Planificación', url: 'https://portal.imp.gob.pe/Normas_Urbanisticas/metropolitano/ordenanzas-san-borja.html', action: 'Ver catálogo oficial' },
        { title: 'Ordenanza N° 2851-MML', type: 'Ordenanza metropolitana', desc: 'Índice de usos para la ubicación de actividades urbanas del distrito de San Borja.', source: 'El Peruano', url: 'https://busquedas.elperuano.pe/dispositivo/NL/2554292-1', extra: ['Consultar fe de erratas', 'https://busquedas.elperuano.pe/dispositivo/NL/2556956-1'] }
      ] },
      { title: 'Distrital', scope: 'Instrumentos de San Borja', icon: 'building', docs: [
        { title: 'Ordenanza N° 491-MSB', type: 'Ordenanza distrital', desc: 'Reglamento de Edificaciones y Normas Complementarias de la Zonificación. Texto original en el boletín del 8 de diciembre de 2012.', source: 'El Peruano · Archivo del MEF', url: 'https://www.mef.gob.pe/contenidos/servicios_web/conectamef_quechua/pdf/normas_legales_2012/NL20121208.PDF', extra: ['Consultar TUO de 2025', 'https://www.gob.pe/institucion/munisanborja/informes-publicaciones/6856020-texto-unico-ordenado-tuo-de-la-ordenanza-n-491-msb-aprobado-por-decreto-de-alcaldia-n-002-2025-msb-a'] },
        { title: 'PUD de San Borja', type: 'Plan urbano distrital · 2020–2030', desc: 'Plan Urbano Distrital del distrito de San Borja 2020–2030. Consulta la publicación municipal y sus documentos.', source: 'Municipalidad de San Borja', url: pud }
      ] }
    ];
    const external = (url, label, cls = '') => `<a class="${cls}" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)} ${icon('arrow')}<span class="planning-sr"> (abre en una pestaña nueva)</span></a>`;
    return `${categoryHero({ title: 'Planeamiento urbano', description: 'Planes, leyes y ordenanzas para comprender cómo se organiza y desarrolla nuestro territorio.', icon: 'file' }, 'UPU San Borja')}
      <section class="container internal-content planning-content" aria-label="Documentos de planeamiento">
        <a href="#inicio" data-home class="back-link">${icon('back')} Volver al inicio</a>
        <div class="planning-intro"><div><span class="eyebrow">BIBLIOTECA DE PLANEAMIENTO</span><h2>Del territorio al distrito</h2><p>Explora los documentos por ámbito y consulta sus fuentes oficiales.</p></div><span class="planning-summary">3 ámbitos de consulta</span></div>
        <div class="planning-grid">${groups.map((group, index) => `<section class="planning-group planning-group--${index}" aria-labelledby="planning-${index}">
          <header class="planning-group__heading"><span class="planning-group__icon">${icon(group.icon)}</span><div><h3 id="planning-${index}">${group.title}</h3><p>${group.scope}</p></div><span class="planning-count" aria-label="${group.docs.length} accesos">${group.docs.length}</span></header>
          <div class="planning-documents">${group.docs.map(doc => `<article class="planning-document"><span class="planning-document__type">${safe(doc.type)}</span><h4>${external(doc.url, doc.url === pud ? 'PUD de San Borja · 2020–2030' : doc.title, 'planning-document__open')}</h4><span class="planning-document__source">${safe(doc.source)}${doc.action ? ' · Catálogo oficial' : ''}</span><details class="planning-document__details"><summary>Ver detalle<span class="planning-sr"> de ${safe(doc.title)}</span></summary><p>${safe(doc.desc)}</p></details>${doc.extra ? `<div class="planning-document__links">${external(doc.extra[1], doc.extra[0], 'planning-document__extra')}</div>` : ''}</article>`).join('')}</div>
        </section>`).join('')}</div>
      </section>`;
  }

  function infoPageHTML(name) {
    if (name === 'planeamiento') return planningPageHTML();
    const configs = {
      'datos-abiertos': {
        title: 'Datos abiertos',
        desc: 'Acceso a información geográfica y datos espaciales del territorio.',
        icon: 'database',
        items: [
          [
            'Zonificación urbana',
            'Delimitaciones y categorías de zonificación.',
            'layers',
          ],
          [
            'Red vial y secciones',
            'Información territorial del sistema vial local.',
            'route',
          ],
          [
            'Espacios públicos',
            'Capas e inventario geográfico de áreas públicas.',
            'tree',
          ],
        ],
        notice:
          'El catálogo público y las descargas se habilitarán cuando los datos cuenten con validación, fuentes y condiciones de uso.',
      },
      planeamiento: {
        title: 'Planeamiento urbano',
        desc: 'Instrumentos, normas e información que orientan la gestión del territorio distrital.',
        icon: 'file',
        items: [
          [
            'Uso del suelo',
            'Clasificación del suelo y compatibilidades.',
            'building',
            'uso-suelo',
          ],
          [
            'Movilidad',
            'Red vial, jerarquía y secciones urbanas.',
            'car',
            'movilidad',
          ],
          [
            'Normativa urbana',
            'Parámetros, reglamentos y documentos.',
            'file',
            'normativa',
          ],
        ],
        notice:
          'Selecciona un tema para consultar los visores relacionados. Algunas herramientas se encuentran pendientes de publicación.',
      },
      nosotros: {
        title: 'Nosotros',
        desc: 'Conoce la Unidad de Planeamiento Urbano de San Borja y sus herramientas territoriales.',
        icon: 'users',
        items: [
          [
            'Unidad de Planeamiento Urbano',
            'Información y herramientas para el planeamiento territorial.',
            'building',
          ],
          [
            'Innovación y datos espaciales',
            'Uso de información geográfica para apoyar decisiones urbanas.',
            'database',
          ],
          [
            'Servicio a la ciudadanía',
            'Acceso organizado a visores geográficos e información pública.',
            'users',
          ],
        ],
        notice:
          'UPU San Borja · Unidad de Planeamiento Urbano · Oficina General de Innovación y Desarrollo Económico · Municipalidad de San Borja.',
      },
    };
    const data = configs[name];
    if (!data) return notFoundHTML();
    if (name === 'nosotros') {
      return `${categoryHero({ title: data.title, description: data.desc, icon: data.icon }, 'UPU San Borja')}
        <section class="container internal-content about-content" aria-labelledby="about-title">
          <a href="#inicio" data-home class="back-link">${icon('back')} Volver al inicio</a>
          <h2 class="block-title" id="about-title">Nuestra iniciativa</h2>
          <p class="about-intro">UPU San Borja es una iniciativa impulsada por la Oficina General de Innovación y Desarrollo Económico (OGIDE) de la Municipalidad de San Borja, a través del trabajo técnico de la Unidad de Planeamiento Urbano.</p>
          <section class="about-mission" aria-labelledby="mission-title">
            <h3 id="mission-title">Nuestra misión</h3>
            <p>Facilitar el acceso público a información territorial, promover la ciencia de datos espaciales y contribuir al planeamiento urbano basado en evidencia, con transparencia e innovación.</p>
          </section>
        </section>`;
    }
    return `${categoryHero({ title: data.title, description: data.desc, icon: data.icon }, 'UPU San Borja')}
      <section class="container internal-content"><a href="#inicio" data-home class="back-link">${icon('back')} Volver al inicio</a>
        <h2 class="block-title">${data.title === 'Nosotros' ? 'Nuestra iniciativa' : 'Información principal'}</h2>
        <div class="related-list">${data.items.map(([title, desc, ic, category]) => `<article class="related-card"><div class="related-card__thumb">${icon(ic)}</div><div class="related-card__content"><strong>${safe(title)}</strong><p>${safe(desc)}</p></div>${category ? `<a class="related-card__cta" href="#categoria/${category}" aria-label="Explorar ${safe(title)}"><span>Explorar</span>${icon('arrow')}</a>` : `<span class="related-card__cta disabled" aria-label="Contenido informativo">${icon('info')}</span>`}</article>`).join('')}</div>
      </section>`;
  }

  function searchHTML(searchTerm) {
    const term = normalize(searchTerm);
    const categories = CATEGORIES.filter((c) =>
      normalize([c.title, c.short, c.description].join(' ')).includes(term)
    );
    const viewers = VIEWERS.filter((v) =>
      normalize([v.title, v.label, v.description].join(' ')).includes(term)
    );
    return `<section class="container search-content"><a class="back-link" href="#inicio" data-home>${icon('back')} Volver al inicio</a>
      <div class="eyebrow">EXPLORA SAN BORJA</div><h1 class="section-heading">Resultados de búsqueda</h1>
      <p class="section-lead">Encuentra temas y visores disponibles desde la plataforma UPU.</p>
      ${searchForm(searchTerm, true)}
      ${
        !categories.length && !viewers.length
          ? `<div class="empty-state">${icon('search')}<strong>No se encontraron resultados</strong><p>Prueba con otros términos, por ejemplo: vías, parques, usos o normativa.</p></div>`
          : `
        ${categories.length ? `<h2 class="results-title">Temas (${categories.length})</h2><div class="category-grid">${categories.map((c) => categoryCard(c, CATEGORIES.indexOf(c))).join('')}</div>` : ''}
        ${viewers.length ? `<h2 class="results-title" style="margin-top:32px">Visores (${viewers.length})</h2><div class="viewer-grid">${viewers.map(viewerCard).join('')}</div>` : ''}
      `
      }</section>`;
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
    document.querySelector('#predialDialog[open]')?.close();
    closeMenu();
    const route = decodeURIComponent(location.hash.slice(1) || 'inicio');
    if (route === 'inicio' || route === '') main.innerHTML = homeHTML();
    else if (route.startsWith('categoria/'))
      main.innerHTML = categoryHTML(route.slice('categoria/'.length));
    else if (route === 'visores') main.innerHTML = viewAllHTML();
    else if (route.startsWith('buscar/'))
      main.innerHTML = searchHTML(route.slice('buscar/'.length));
    else if (['datos-abiertos', 'planeamiento', 'nosotros'].includes(route))
      main.innerHTML = infoPageHTML(route);
    else main.innerHTML = notFoundHTML();
    document.title =
      route === 'inicio'
        ? 'UPU San Borja | Planeamiento Urbano'
        : 'UPU San Borja | ' +
          (CATEGORIES.find((c) => route.endsWith(c.id))?.title ||
            route.split('/')[0]);
    document
      .querySelectorAll('.desktop-nav a')
      .forEach((a) =>
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + route)
      );
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-predial]')) {
      openPredial();
      return;
    }
    const explore = event.target.closest('[data-explore]');
    if (explore) {
      event.preventDefault();
      closeMenu();
      if (location.hash !== '#inicio') location.hash = 'inicio';
      renderRoute(false);
      requestAnimationFrame(() =>
        document
          .getElementById('descubre')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
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
    if (!mobileNav.hidden && !event.target.closest('.mobile-nav, #menuToggle'))
      closeMenu();
  });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-search-form]');
    if (!form) return;
    event.preventDefault();
    const q = form.querySelector('input[name="q"]')?.value.trim();
    if (!q) return;
    location.hash = 'buscar/' + encodeURIComponent(q);
    if (location.hash === '#buscar/' + encodeURIComponent(q)) renderRoute();
  });
  window.addEventListener('hashchange', () => renderRoute());
  window.addEventListener('resize', () => {
    if (window.innerWidth > 850) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  let predialDialog;
  function openPredial() {
    if (!predialDialog) {
      predialDialog = document.createElement('dialog');
      predialDialog.id = 'predialDialog';
      predialDialog.className = 'predial-dialog';
      predialDialog.setAttribute('aria-labelledby', 'predial-title');
      predialDialog.innerHTML = `<header class="predial-dialog__header"><div><strong id="predial-title">PREDIAL</strong><span>UPU San Borja · Simulación de cabida</span></div><button type="button" aria-label="Cerrar PREDIAL" autofocus>${icon('close')}</button></header><div class="predial-dialog__body"><p class="predial-loading" role="status">Cargando PREDIAL…</p><iframe title="PREDIAL: simulador de cabida" src="modules/predial/index.html" allow="fullscreen" allowfullscreen></iframe></div>`;
      document.body.append(predialDialog);
      predialDialog.querySelector('button').addEventListener('click', () => predialDialog.close());
      predialDialog.addEventListener('close', () => document.body.classList.remove('predial-is-open'));
      const frame = predialDialog.querySelector('iframe');
      window.addEventListener('message', event => {
        if (event.source === frame.contentWindow && event.origin === location.origin && event.data?.type === 'PREDIAL_READY') {
          predialDialog.querySelector('.predial-loading').hidden = true;
        }
      });
      setTimeout(() => {
        const status = predialDialog.querySelector('.predial-loading');
        if (!status.hidden) status.textContent = 'La carga está tardando. Comprueba tu conexión a Internet.';
      }, 25000);
    }
    document.body.classList.add('predial-is-open');
    predialDialog.showModal();
  }

  // Intro institucional con transición automática al logo del header.
  const intro = document.querySelector('#intro');
  let introTimeout;
  let introClosing = false;
  async function dismissIntro() {
    if (!intro || introClosing) return;
    introClosing = true;
    clearTimeout(introTimeout);
    const source = intro.querySelector('.intro__halo img');
    const destination = document.querySelector('.brand-mark img');
    if (
      !source ||
      !destination ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !source.animate
    ) {
      intro.remove();
      return;
    }
    const start = source.getBoundingClientRect();
    const end = destination.getBoundingClientRect();
    const targetStyle = getComputedStyle(destination);
    const targetVisibility = destination.style.visibility;
    const flyingLogo = source.cloneNode(true);
    flyingLogo.setAttribute('aria-hidden', 'true');
    Object.assign(flyingLogo.style, {
      position: 'fixed',
      zIndex: '151',
      margin: '0',
      animation: 'none',
      pointerEvents: 'none',
      left: `${start.left}px`,
      top: `${start.top}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
      objectFit: 'contain',
      maxWidth: 'none',
      maxHeight: 'none',
      background: 'transparent',
      boxShadow: 'none',
      borderRadius: '0',
    });
    document.body.append(flyingLogo);
    source.style.visibility = 'hidden';
    destination.style.visibility = 'hidden';
    intro.classList.add('is-hidden');
    try {
      await flyingLogo.animate(
        [
          {
            left: `${start.left}px`,
            top: `${start.top}px`,
            width: `${start.width}px`,
            height: `${start.height}px`,
            filter: 'brightness(0) invert(1)',
          },
          {
            left: `${end.left}px`,
            top: `${end.top}px`,
            width: `${end.width}px`,
            height: `${end.height}px`,
            filter: targetStyle.filter,
          },
        ],
        {
          duration: 850,
          easing: 'cubic-bezier(.65, 0, .25, 1)',
          fill: 'forwards',
        }
      ).finished;
    } finally {
      destination.style.visibility = targetVisibility;
      flyingLogo.remove();
      intro.remove();
    }
  }
  introTimeout = setTimeout(dismissIntro, 1700);

  renderRoute(false);
})();
