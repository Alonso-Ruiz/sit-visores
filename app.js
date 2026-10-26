(() => {
  'use strict';

  const CATEGORIES = [
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
      image: 'assets/indice_uso.png',
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
      image: 'assets/vias.png',
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
      image: 'assets/espacio_publico.png',
      label: 'ESPACIO URBANO',
      description: 'Ubica parques, áreas verdes y equipamiento urbano.',
      icon: 'tree',
      categories: ['espacio-publico'],
      url: 'https://espaciospublicosmsb.netlify.app/',
    },
    {
      id: 'soterrados',
      title: 'Soterrados',
      image: 'assets/soterrado.png',
      label: 'INFRAESTRUCTURA',
      description: 'Visualiza la infraestructura de servicios soterrados.',
      icon: 'route',
      categories: ['espacio-publico'],
      url: 'https://inventariodiestra2026.netlify.app/',
    },
    {
      id: 'slo',
      title: 'SLO',
      image: 'assets/slo.png',
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
      image: 'assets/convenios.png',
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
  let territorialSearchDataPromise;
  let territorialSearchState = { records: [], visible: 0 };
  let selectedTerritorialRecord;
  let searchRequest = 0;
  let territorialSearchTerm = '';
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
      <div class="viewer-card__visual"><img src="${safe(viewer.image)}" alt="Vista previa de ${safe(viewer.title)}" loading="lazy"></div>
      <div class="viewer-card__info"><span class="viewer-card__label">${safe(viewer.label || 'CONSULTA TERRITORIAL')}</span>
        <h3 class="viewer-card__title">${safe(viewer.title)}</h3><p class="viewer-card__desc">${safe(viewer.description)}</p>
        <div class="viewer-card__bottom">${link}<span class="viewer-card__symbol">${icon(viewer.icon)}</span></div>
      </div>
    </article>`;
  }

  function searchForm(text = '', secondary = false) {
    return `<div class="search-autocomplete"><form class="${secondary ? 'search-content__controls' : 'hero-search'}" data-search-form role="search">
      ${icon('search')}<input name="q" type="search" role="combobox" aria-label="Buscar información territorial" aria-autocomplete="list" aria-expanded="false" aria-controls="territorialSuggestions" value="${safe(text)}" placeholder="Busca un parque, vía, actividad o código…" autocomplete="off" required>
      <button class="search-clear" type="button" data-clear-search aria-label="Limpiar búsqueda" title="Limpiar búsqueda" hidden>${icon('close')}</button><button type="submit"><span>Buscar</span>${icon('arrow')}</button></form>
      <div id="territorialSuggestions" class="search-suggestions" role="listbox" aria-label="Coincidencias territoriales" hidden></div><span class="search-status" role="status"></span></div>`;
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

      <div id="territorialRecordHost" class="container territorial-record-host" hidden></div>
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
          <button type="button" class="planning-group__heading" aria-controls="planning-documents-${index}" aria-expanded="true"><span class="planning-group__icon">${icon(group.icon)}</span><span class="planning-group__heading-copy"><span class="planning-group__title" id="planning-${index}">${group.title}</span><span class="planning-group__scope">${group.scope}</span></span><span class="planning-count" aria-label="${group.docs.length} accesos">${group.docs.length}</span><span class="planning-group__chevron" aria-hidden="true">${icon('chevron')}</span></button>
          <div class="planning-documents" id="planning-documents-${index}">${group.docs.map(doc => `<article class="planning-document"><span class="planning-document__type">${safe(doc.type)}</span><h4>${external(doc.url, doc.url === pud ? 'PUD de San Borja · 2020–2030' : doc.title, 'planning-document__open')}</h4><span class="planning-document__source">${safe(doc.source)}${doc.action ? ' · Catálogo oficial' : ''}</span><details class="planning-document__details"><summary>Ver detalle<span class="planning-sr"> de ${safe(doc.title)}</span></summary><p>${safe(doc.desc)}</p></details>${doc.extra ? `<div class="planning-document__links">${external(doc.extra[1], doc.extra[0], 'planning-document__extra')}</div>` : ''}</article>`).join('')}</div>
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

  // Read only the JSON literal in the supplied exports; never execute their scripts.
  function readDataLiteral(source) {
    const start = source.indexOf('=') + 1;
    let depth = 0, quoted = false, escaped = false, first = -1;
    for (let i = start; i < source.length; i++) {
      const c = source[i];
      if (first < 0) { if (/\s/.test(c)) continue; first = i; }
      if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; continue; }
      if (c === '"') quoted = true;
      else if (c === '{' || c === '[') depth++;
      else if ((c === '}' || c === ']') && --depth === 0) return JSON.parse(source.slice(first, i + 1));
    }
    throw new Error('Archivo territorial incompleto');
  }

  function loadTerritorialSearchData() {
    if (!territorialSearchDataPromise) {
      const sources = [
        ['Inventario2026_0.js', 'soterrados', 'Soterrados'],
        ['ParquesOf_5.js', 'parques', 'Parques'],
        ['indice_distrital_actual.js', 'indice-usos', 'Índice de usos'],
        ['red_vial_0.js', 'vias', 'Vías'],
        ['CuadranteSLO100mx100m_2.js', 'slo', 'SLO'],
      ];
      territorialSearchDataPromise = Promise.all(sources.map(async ([file, dataset, datasetName]) => {
        const response = await fetch('data/territorial/' + file);
        if (!response.ok) throw new Error('No se pudo cargar ' + file);
        const data = readDataLiteral(await response.text());
        return (Array.isArray(data) ? data : data.features).map((feature, i) => {
          const p = feature.properties || feature;
          const title = String(p.NOMBRE || p.NOMBRE_FIN || p.NOMBRE_GIRO_EQUIVALENTE_REV3 || p.ACTIVIDAD || p.Name || p['Cód_Cuadr'] || datasetName);
          const subtitle = [p['CÓDIGO'] || p.COD_GIRO || p['Cód_Cuadr'], p.TRAMO || p.CLASIFICAC].filter(Boolean).join(' · ');
          const searchable = [datasetName, title, subtitle, ...Object.values(p).flatMap(v => Array.isArray(v) ? v : typeof v === 'object' ? [] : [v])].join(' ');
          return { id: dataset + '-' + i, dataset, datasetName, title, subtitle, searchable, properties: p, geometry: feature.geometry };
        });
      })).then(groups => groups.flat()).catch(error => { territorialSearchDataPromise = null; throw error; });
    }
    return territorialSearchDataPromise;
  }

  const searchKey = value => normalize(value).replace(/[^a-z0-9]+/g, ' ').trim();
  function searchTokens(term) { return [searchKey(term).split(/\s+/).filter(Boolean)]; }
  function nearWord(a, b) {
    if (a.length < 4 || Math.abs(a.length - b.length) > 1 || /\d/.test(a)) return false;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const next = [i];
      for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = next;
    }
    return previous[b.length] <= 1;
  }
  function hideSuggestions() {
    searchRequest++;
    document.querySelectorAll('.search-suggestions').forEach(el => el.hidden = true);
    document.querySelectorAll('[data-search-form] input').forEach(el => { el.setAttribute('aria-expanded', 'false'); el.removeAttribute('aria-activedescendant'); });
  }
  async function openTerritorialSearch(term) {
    const input = document.querySelector('[data-search-form] input');
    const box = document.getElementById('territorialSuggestions');
    if (!box || !input) return;
    const request = ++searchRequest;
    territorialSearchTerm = term;
    if (term.trim().length < 2) { hideSuggestions(); return; }
    box.hidden = false;
    box.innerHTML = '<p class="search-suggestions__message">Buscando información…</p>';
    input.setAttribute('aria-expanded', 'true');
    input.removeAttribute('aria-activedescendant');
    try {
      const records = await loadTerritorialSearchData();
      if (request !== searchRequest || !input.isConnected) return;
      const query = searchKey(term), tokens = searchTokens(term)[0];
      const scored = records.map(record => {
        const text = searchKey(record.searchable), title = searchKey(record.title);
        const words = text.split(' ');
        let score = title === query ? 100 : title.startsWith(query) ? 70 : title.includes(query) ? 50 : 0;
        for (const token of tokens) {
          if (text.includes(token)) score += 10;
          else if (words.some(word => nearWord(token, word))) score += 2;
          else return null;
        }
        return { record, score };
      }).filter(Boolean).sort((a,b) => b.score - a.score || a.record.title.localeCompare(b.record.title, 'es'));
      territorialSearchState = { records: scored.map(item => item.record), visible: 12 };
      const matches = territorialSearchState.records;
      box.innerHTML = matches.length ? matches.slice(0, 12).map((record, i) => `<button type="button" role="option" aria-selected="false" tabindex="-1" id="suggestion-${i}" data-territorial-record="${safe(record.id)}"><span class="search-suggestions__type">${safe(record.datasetName)}</span><strong>${safe(record.title)}</strong><small>${safe(record.subtitle || 'Ver información disponible')}</small></button>`).join('') : '<p class="search-suggestions__message">No hay coincidencias. Prueba con un nombre, tramo, actividad o código de los archivos disponibles.</p>';
      input.closest('.search-autocomplete').querySelector('[role="status"]').textContent = matches.length ? `${matches.length} coincidencias. Se muestran las primeras ${Math.min(12, matches.length)}.` : 'Sin coincidencias.';
    } catch {
      if (request === searchRequest) box.innerHTML = '<p class="search-suggestions__message">No se pudieron cargar los datos. Vuelve a escribir para reintentar.</p>';
    }
  }

  function territorialFields(record, tabName) {
    const ignored = new Set(['BUSQUEDA', 'NOMBRES_PARA_EL_VISOR', 'timestamp', 'begin', 'end', 'altitudeMo', 'tessellate', 'extrude', 'visibility', 'drawOrder', 'icon']);
    let entries = Object.entries(record.properties).filter(([key, value]) =>
      !ignored.has(key) && value !== null && value !== undefined && value !== '' && !key.toUpperCase().startsWith('LINK')
    );
    const preferred = {
      'Índice de usos': ['NOMBRE_GIRO_EQUIVALENTE_REV3', 'COD_GIRO', 'ACTIVIDAD', 'DESCRIPCIÓN DE LA CLASE', 'ZONAS', 'OBSERVACIONES'],
      'Vías': ['NOMBRE_FIN', 'CATEGORÍA', 'CLASIFIC', 'TRAMO', 'ANCHO', 'COMPETENCI'],
      'SLO': ['Cód_Cuadr', 'Altura_ml', 'Altitud_me', 'Alt_+45', 'SC_5%', 'Alt_RD_Pis'],
      'Espacios públicos': ['NOMBRE', 'CLASIFICAC', 'ÁREA', 'AREA VERDE', 'ATU', 'ALT_MAX(m)'],
      'Soterrados': ['Name', 'TIPO', 'nro orden', 'CAPACIDAD'],
    }[tabName];
    if (preferred) {
      const ordered = preferred.map((key) => entries.find(([name]) => name === key)).filter(Boolean);
      entries = [...ordered, ...entries.filter(([key]) => !preferred.includes(key))];
    }
    const labels = { Name: 'Código', TIPO: 'Tipo', CAPACIDAD: 'Capacidad', 'nro orden': 'Número de orden', NOMBRE: 'Nombre', NOMBRE_FIN: 'Nombre de la vía', 'CÓDIGO': 'Código', COD_GIRO: 'Código de giro', NOMBRE_GIRO_EQUIVALENTE_REV3: 'Nombre de la actividad', CLASIFICAC: 'Clasificación', CLASIFIC: 'Clasificación', 'ÁREA': 'Área (m²)', 'AREA VERDE': 'Área verde (m²)', TRAMO: 'Tramo', ANCHO: 'Ancho (m)', COMPETENCI: 'Competencia', 'Cód_Cuadr': 'Código de cuadrante', Altura_ml: 'Altura disponible (m)', Altitud_me: 'Altitud media (m)', Alt_RD_Pis: 'Altura de referencia (pisos)' };
    const compact = record.datasetName === 'Parques';
    const rows = entries.map(([key, value], index) => {
      let display = value;
      if (key === 'ZONAS' && value && typeof value === 'object')
        display = Object.entries(value).filter(([, allowed]) => allowed === 'X').map(([zone]) => zone).join(', ') || 'Sin zonas indicadas';
      else if (Array.isArray(value)) display = value.filter(Boolean).join(', ');
      else if (value && typeof value === 'object') display = Object.entries(value).map(([label, item]) => `${label}: ${item}`).join(' · ');
      return `<div class="territorial-info__row${compact && index >= 6 ? ' territorial-info__row--extra' : ''}"${compact && index >= 6 ? ' hidden' : ''}><dt>${safe(labels[key] || key)}</dt><dd>${safe(display)}</dd></div>`;
    }).join('');
    if (compact && entries.length > 6) return rows + '<button class="territorial-info__more" type="button" data-show-all-fields aria-expanded="false">Ver más información</button>';
    return rows;
  }

  function territorialTabContent(record, tabName) {
    const recordTab = { Parques: 'Espacios públicos' }[record.datasetName] || record.datasetName;
    if (tabName !== recordTab)
      return `<div class="territorial-tab-empty">${icon('info')}<p>Esta ficha todavía no tiene datos vinculados a <strong>${safe(tabName)}</strong>. Puedes abrir el visor correspondiente para consultar esa información.</p></div>`;
    const rows = territorialFields(record, tabName);
    return rows ? `<dl class="territorial-info">${rows}</dl>` : '<p>No hay información disponible en esta sección.</p>';
  }

  function geometryPreview(geometry) {
    if (!geometry?.coordinates) return '';
    const points = [], lines = [];
    function collect(value) {
      if (!Array.isArray(value)) return;
      if (Array.isArray(value[0]) && typeof value[0][0] === 'number') { lines.push(value); points.push(...value); }
      else if (typeof value[0] === 'number') { points.push(value); lines.push([value]); }
      else value.forEach(collect);
    }
    collect(geometry.coordinates);
    const valid = points.filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (!valid.length) return '';
    const xs = valid.map(p => p[0]), ys = valid.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(260 / (maxX - minX || 1), 210 / (maxY - minY || 1));
    const project = p => [160 + (p[0] - (minX + maxX) / 2) * scale, 135 - (p[1] - (minY + maxY) / 2) * scale];
    const polygon = geometry.type.includes('Polygon');
    return `<svg viewBox="0 0 320 270" role="img" aria-label="Geometría del registro seleccionado">${lines.map(line => line.length === 1 ? `<circle cx="${project(line[0])[0]}" cy="${project(line[0])[1]}" r="9" fill="#087653"/>` : `<path d="${line.map((p,i) => (i ? 'L' : 'M') + project(p).join(',')).join(' ')}${polygon ? 'Z' : ''}" fill="${polygon ? '#9dd3b9' : 'none'}" fill-rule="evenodd" stroke="#087653" stroke-width="3" stroke-linejoin="round"/>`).join('')}</svg>`;
  }

  function showTerritorialRecord(record, query = '') {
    const tabs = ['Parámetros', 'Índice de usos', 'Residencial', 'Operación', 'Vías', 'SLO', 'Espacios públicos', 'Soterrados'];
    const viewers = {
      'Índice de usos': 'https://mapausoscompatible.netlify.app/',
      'Vías': 'https://sistemavial.msb.gob.pe/',
      'SLO': 'https://visorslo.netlify.app/',
      'Espacios públicos': 'https://espaciospublicosmsb.netlify.app/',
      'Soterrados': 'https://inventariodiestra2026.netlify.app/',
    };
    const tabFor = { 'Índice de usos': 'Índice de usos', 'Vías': 'Vías', 'SLO': 'SLO', 'Parques': 'Espacios públicos', 'Soterrados': 'Soterrados' };
    const activeTab = tabFor[record.datasetName] || record.datasetName;
    const title = record.title;
    const intro = {
      SLO: 'Restricciones en el entorno de la Base Aérea Las Palmas.',
      Vías: record.properties.TRAMO || record.subtitle,
      Parques: record.properties.CLASIFICAC || 'Información de espacio público.',
      Soterrados: 'Inventario de infraestructura de servicios soterrados.',
      'Índice de usos': record.properties.ACTIVIDAD || 'Actividad urbana y compatibilidad de usos.',
    }[record.datasetName] || record.subtitle;
    const tabsMarkup = [activeTab].map((tab, index) => `<button type="button" role="tab" id="territorial-tab-${index}" aria-selected="${tab === activeTab}" aria-controls="territorialTabPanel" tabindex="${tab === activeTab ? 0 : -1}" data-info-tab="${safe(tab)}" data-viewer-url="${safe(viewers[tab] || '')}">${safe(tab)}</button>`).join('');
    const viewerUrl = viewers[activeTab];
    const viewerLink = viewerUrl ? `<a class="territorial-info__open" href="${viewerUrl}" target="_blank" rel="noopener noreferrer">Abrir visor ${icon('arrow')}</a>` : '';
    const location = record.coordinates
      ? `<a class="territorial-info__location" href="https://www.google.com/maps?q=${record.coordinates[1]},${record.coordinates[0]}" target="_blank" rel="noopener noreferrer">Ver ubicación en el mapa ${icon('arrow')}</a>`
      : '';
    const panel = territorialTabContent(record, activeTab);
    document.querySelectorAll('.territorial-dialog[open]').forEach((dialog) => dialog.close());
    document.querySelector('.territorial-record-dialog')?.remove();
    document.querySelector('.territorial-search-dialog')?.remove();
    selectedTerritorialRecord = record;
    hideSuggestions();
    const host = document.getElementById('territorialRecordHost');
    if (!host) return;
    host.hidden = false;
    host.innerHTML = `<article tabindex="-1" class="territorial-record-dialog" data-record-id="${safe(record.id)}" data-query-title="${safe(title)}" aria-labelledby="territorialRecordTitle"><header class="territorial-record__header"><span class="territorial-record__pin">${icon('map')}</span><div><h2 id="territorialRecordTitle">${safe(title)}</h2><p>${safe(record.datasetName)}${record.subtitle ? ` · ${safe(record.subtitle)}` : ''}</p></div><button type="button" data-close-territorial aria-label="Cerrar ficha">${icon('close')}</button></header><div class="territorial-record__layout"><aside class="territorial-record__location"><div class="territorial-record__location-head"><span>UBICACIÓN</span><span>Esquema ilustrativo</span></div><div class="territorial-record__map" aria-hidden="true"><span class="territorial-record__road territorial-record__road--vertical"></span><span class="territorial-record__road territorial-record__road--horizontal"></span><i class="territorial-record__lot territorial-record__lot--one"></i><i class="territorial-record__lot territorial-record__lot--two"></i><i class="territorial-record__lot territorial-record__lot--three"></i><i class="territorial-record__lot territorial-record__lot--four"></i><span class="territorial-record__marker">${icon('map')}</span></div><strong>${safe(title)}</strong><p>Esquema de muestra; no representa la ubicación ni la forma real del predio.</p>${location}</aside><section class="territorial-record__details"><nav class="territorial-record__tabs" role="tablist" aria-label="Información territorial">${tabsMarkup}</nav><div class="territorial-record__panel"><div class="territorial-record__section-title"><span class="territorial-record__section-icon">${icon('building')}</span><div><h3>${safe(activeTab === 'SLO' ? 'Superficies Limitadoras de Obstáculos (SLO)' : activeTab)}</h3><p>${safe(intro || 'Información territorial relacionada con la consulta.')}</p></div></div><div id="territorialTabPanel" role="tabpanel" aria-labelledby="territorial-tab-0" class="territorial-record__tab-content">${panel}</div><p class="territorial-record__note">${activeTab === ({ Parques: 'Espacios públicos' }[record.datasetName] || record.datasetName) ? 'Información disponible en los archivos territoriales compartidos.' : `Esta consulta no cuenta con datos asociados a ${safe(activeTab)}.`}</p><div class="territorial-record__actions">${viewerLink}${location}</div></div></section></div></article>`;
    const preview = geometryPreview(record.geometry);
    if (preview) {
      const map = host.querySelector('.territorial-record__map');
      map.innerHTML = preview;
      map.removeAttribute('aria-hidden');
      map.classList.add('territorial-record__map--geometry');
      host.querySelector('.territorial-record__location-head span:last-child').textContent = 'Geometría del archivo';
      host.querySelector('.territorial-record__location > p').textContent = 'Forma del registro según el archivo de origen. Sin mapa base.';
    }
    host.querySelector('article').focus({ preventScroll: true });
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    document.querySelector('.territorial-dialog[open]')?.close();
    document.querySelector('.territorial-record-dialog[open]')?.close();
    closeMenu();
    const routeHash = location.hash;
    const route = decodeURIComponent(routeHash.slice(1) || 'inicio');
    if (route === 'inicio' || route === '') main.innerHTML = homeHTML();
    else if (route.startsWith('categoria/'))
      main.innerHTML = categoryHTML(route.slice('categoria/'.length));
    else if (route === 'visores') main.innerHTML = viewAllHTML();
    else if (route.startsWith('buscar/')) {
      main.innerHTML = homeHTML();
      const term = route.slice('buscar/'.length);
      main.querySelector('[name="q"]').value = term;
      openTerritorialSearch(term);
    }
    else if (['datos-abiertos', 'planeamiento', 'nosotros'].includes(route))
      main.innerHTML = infoPageHTML(route);
    else main.innerHTML = notFoundHTML();
    syncPlanningAccordions();
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

  function syncPlanningAccordions() {
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    document.querySelectorAll('.planning-group__heading').forEach((button) => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;
      button.disabled = !mobile;
      button.setAttribute('aria-expanded', String(!mobile));
      panel.hidden = mobile;
    });
  }

  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });
  document.addEventListener('click', (event) => {
    const recordButton = event.target.closest('[data-territorial-record]');
    if (recordButton) {
      const record = territorialSearchState.records.find((item) => item.id === recordButton.dataset.territorialRecord);
      if (record) {
        showTerritorialRecord(record, territorialSearchTerm);
      }
      return;
    }
    if (event.target.closest('[data-show-all-fields]')) {
      const button = event.target.closest('[data-show-all-fields]');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? 'Ver más información' : 'Ver menos información';
      button.closest('.territorial-record__tab-content').querySelectorAll('.territorial-info__row--extra').forEach(row => { row.hidden = expanded; });
      return;
    }
    const tab = event.target.closest('[data-info-tab]');
    if (tab) {
      const dialog = tab.closest('.territorial-record-dialog');
      const record = selectedTerritorialRecord;
      if (!dialog || !record) return;
      dialog.querySelectorAll('[data-info-tab]').forEach((button) => {
        const selected = button === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      const label = tab.dataset.infoTab;
      dialog.querySelector('.territorial-record__section-title h3').textContent = label === 'SLO' ? 'Superficies Limitadoras de Obstáculos (SLO)' : label;
      const intro = { SLO: 'Restricciones en el entorno de la Base Aérea Las Palmas.', Vías: record.properties.TRAMO || record.subtitle, Parques: record.properties.CLASIFICAC || 'Información de espacio público.', 'Espacios públicos': record.properties.CLASIFICAC || 'Información de espacio público.', Soterrados: 'Inventario de infraestructura de servicios soterrados.', 'Índice de usos': record.properties.ACTIVIDAD || 'Actividad urbana y compatibilidad de usos.' }[label] || 'Información territorial relacionada con la consulta.';
      dialog.querySelector('.territorial-record__section-title p').textContent = intro;
      dialog.querySelector('#territorialTabPanel').innerHTML = territorialTabContent(record, label);
      dialog.querySelector('#territorialTabPanel').setAttribute('aria-labelledby', tab.id);
      const sourceTab = { Parques: 'Espacios públicos' }[record.datasetName] || record.datasetName;
      dialog.querySelector('.territorial-record__note').textContent = label === sourceTab
        ? 'Información disponible en los archivos territoriales compartidos.'
        : `Esta consulta no cuenta con datos asociados a ${label}.`;
      const actions = dialog.querySelector('.territorial-record__actions');
      const mapLink = actions.querySelector('.territorial-info__location');
      const mapMarkup = mapLink?.outerHTML || '';
      actions.innerHTML = `${tab.dataset.viewerUrl ? `<a class="territorial-info__open" href="${safe(tab.dataset.viewerUrl)}" target="_blank" rel="noopener noreferrer">Abrir visor ${icon('arrow')}</a>` : ''}${mapMarkup}`;
      return;
    }
    if (event.target.closest('[data-close-territorial]')) {
      const host = document.getElementById('territorialRecordHost');
      if (host) { host.hidden = true; host.innerHTML = ''; }
      document.querySelector('[data-search-form] input')?.focus();
      return;
    }
    const planningToggle = event.target.closest('.planning-group__heading');
    if (planningToggle && !planningToggle.disabled) {
      const panel = document.getElementById(planningToggle.getAttribute('aria-controls'));
      const expanded = planningToggle.getAttribute('aria-expanded') === 'true';
      planningToggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      return;
    }
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
    territorialSearchTerm = q;
    openTerritorialSearch(q);
  });
  let searchDebounce;
  document.addEventListener('input', event => {
    if (!event.target.matches('[data-search-form] input')) return;
    const clearButton = event.target.closest('form').querySelector('[data-clear-search]');
    if (clearButton) clearButton.hidden = !event.target.value;
    clearTimeout(searchDebounce);
    hideSuggestions();
    const input = event.target;
    searchDebounce = setTimeout(() => { if (input.isConnected && document.activeElement === input) openTerritorialSearch(input.value); }, 150);
  });
  document.addEventListener('click', event => {
    const clearButton = event.target.closest('[data-clear-search]');
    if (clearButton) {
      const input = clearButton.closest('form').querySelector('input[name="q"]');
      input.value = '';
      clearButton.hidden = true;
      hideSuggestions();
      input.focus();
      return;
    }
    if (!event.target.closest('.search-autocomplete')) hideSuggestions();
  });
  document.addEventListener('keydown', event => {
    const input = event.target.closest('[data-search-form] input');
    if (!input) return;
    const box = document.getElementById('territorialSuggestions');
    if (event.key === 'Escape') { hideSuggestions(); return; }
    if (!box || box.hidden) return;
    const options = [...box.querySelectorAll('[role="option"]')];
    const current = options.findIndex(el => el.id === input.getAttribute('aria-activedescendant'));
    if (['ArrowDown', 'ArrowUp'].includes(event.key) && options.length) {
      event.preventDefault();
      const next = options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length];
      options.forEach(el => el.setAttribute('aria-selected', String(el === next)));
      input.setAttribute('aria-activedescendant', next.id);
      next.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && current >= 0) { event.preventDefault(); options[current].click(); }
  });
  window.addEventListener('hashchange', () => renderRoute());
  window.addEventListener('resize', () => {
    if (window.innerWidth > 850) closeMenu();
    syncPlanningAccordions();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    const tab = e.target.closest?.('[data-info-tab]');
    if (tab && ['ArrowRight', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      const buttons = [...tab.closest('[role="tablist"]').querySelectorAll('[data-info-tab]')];
      const offset = e.key === 'ArrowRight' ? 1 : -1;
      const next = buttons[(buttons.indexOf(tab) + offset + buttons.length) % buttons.length];
      next.focus();
      next.click();
    }
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
