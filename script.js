const cards = [...document.querySelectorAll('.card')];
const filterButtons = [...document.querySelectorAll('.filter')];
const search = document.querySelector('#address-search');
const grid = document.querySelector('#cardGrid');
const empty = document.querySelector('#empty');
let category = 'todos';
let catalogSearchTerm = '';
let searchDataRecords = [];
let dataSearchMatches = [];
let dataRecommendationIds = new Set();
function normalize(value) {
  return value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
let filterRevision = 0;
let filterAnimations = [];
async function render(animate = false) {
  const revision = ++filterRevision;
  filterAnimations.forEach((animation) => animation.cancel());
  filterAnimations = [];
  const term = normalize(catalogSearchTerm.trim());
  const matches = new Map(
    cards.map((card) => {
      const terms = normalize(card.dataset.text + ' ' + card.textContent);
      const cat =
        category === 'todos' ||
        card.dataset.category.split(' ').includes(category);
      const hasDataMatch = dataRecommendationIds.has(card.dataset.visorId);
      return [card, cat && (!term || terms.includes(term) || hasDataMatch)];
    })
  );
  const motion =
    animate &&
    typeof grid.animate === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = (element, frames, options) => {
    const animation = element.animate(frames, options);
    filterAnimations.push(animation);
    return animation.finished.catch(() => {});
  };
  if (animate) grid.classList.add('filter-ready');
  if (motion) {
    await Promise.all(
      cards
        .filter((card) => !card.hidden && !matches.get(card))
        .map((card) =>
          run(
            card,
            [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'translateY(12px) scale(.96)' },
            ],
            { duration: 180, easing: 'ease-in', fill: 'forwards' }
          )
        )
    );
    if (revision !== filterRevision) return;
  }
  const before = new Map(
    cards
      .filter((card) => !card.hidden && matches.get(card))
      .map((card) => [card, card.getBoundingClientRect()])
  );
  const oldHeight = grid.getBoundingClientRect().height;
  cards.forEach((card) => {
    card.hidden = !matches.get(card);
  });
  filterAnimations.forEach((animation) => animation.cancel());
  filterAnimations = [];
  empty.hidden = [...matches.values()].some(Boolean);
  grid.classList.toggle('filtered', category !== 'todos' || term !== '');
  if (!motion) return;
  const newHeight = grid.getBoundingClientRect().height;
  const transitions = [];
  cards
    .filter((card) => !card.hidden)
    .forEach((card, index) => {
      const previous = before.get(card);
      const next = card.getBoundingClientRect();
      transitions.push(
        run(
          card,
          previous
            ? [
                {
                  transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px) scale(${previous.width / next.width}, ${previous.height / next.height})`,
                  opacity: 1,
                },
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
              ]
            : [
                { transform: 'translateY(20px) scale(.97)', opacity: 0 },
                { transform: 'translateY(0) scale(1)', opacity: 1 },
              ],
          {
            duration: 420,
            delay: previous ? 0 : index * 35,
            easing: 'cubic-bezier(.22,1,.36,1)',
            fill: 'backwards',
          }
        )
      );
    });
  transitions.push(
    run(grid, [{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], {
      duration: 420,
      easing: 'cubic-bezier(.22,1,.36,1)',
    })
  );
  await Promise.all(transitions);
  if (revision === filterRevision) filterAnimations = [];
}
filterButtons.forEach((button) =>
  button.addEventListener('click', () => {
    category = button.dataset.category;
    filterButtons.forEach((other) => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    render(true);
  })
);
search.addEventListener('input', () => {
  dataSearchMatches = findDataMatches(search.value);
  dataRecommendationIds = new Set(dataSearchMatches.map((record) => record.cardId));
  catalogSearchTerm = search.value;
  // Show the best matching real record as the user types. The dropdown still
  // lets them choose a different match when a name has multiple records.
  if (dataSearchMatches.length) showDataDetails(dataSearchMatches[0]);
  else hideDataDetails();
  render(true);
  if (search.value.trim()) showAddressSuggestions();
  else closeAddressSuggestions();
});
render();

const addressInput = document.querySelector('#address-search');
const addressBox = document.querySelector('#address-suggestions');
const clearSearchButton = document.querySelector('#clear-search');
function normalizeSearch(value) {
  return normalize(String(value ?? '')).replace(/[^a-z0-9]+/g, ' ').trim();
}
function findDataMatches(query) {
  const normalizedQuery = normalizeSearch(query);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (normalizedQuery.length < 2 || !searchDataRecords.length) return [];
  const rawQuery = String(query).trim();
  const codeQuery = /[0-9]/.test(rawQuery) && /^[a-z0-9]+(?:[-_][a-z0-9]*)*$/i.test(rawQuery);
  const matches = searchDataRecords.map((record) => {
    const card = cards.find((item) => item.dataset.visorId === record.cardId);
    const inCategory = card && (category === 'todos' || card.dataset.category.split(' ').includes(category));
    const searchable = normalizeSearch(`${record.title} ${record.kind} ${record.search}`);
    const title = normalizeSearch(record.title);
    const detailValues = Object.values(record.details).map(normalizeSearch);
    const searchableFields = [title, ...detailValues, normalizeSearch(record.search)];
    if (!inCategory) return null;
    if (codeQuery) {
      const codeMatch = [title, ...detailValues].some((value) =>
        value === normalizedQuery || (normalizedQuery.length >= 2 && value.startsWith(normalizedQuery))
      );
      return codeMatch ? { record, score: 4 } : null;
    }
    const hasSingleLetterTerm = terms.some((term) => term.length === 1);
    const phraseMatch = searchableFields.some((value) => value.includes(normalizedQuery));
    if (hasSingleLetterTerm && !phraseMatch) return null;
    if (!terms.every((term) => searchable.includes(term))) return null;
    const detailsText = detailValues.join(' ');
    const score = title.includes(normalizedQuery) ? 3 : detailsText.includes(normalizedQuery) ? 2 : searchable.includes(normalizedQuery) ? 1 : 0;
    return { record, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  const seenActivityCodes = new Set();
  return matches.filter(({ record }) => {
    if (record.kind !== 'Uso del suelo') return true;
    const code = record.details['Código de giro'];
    if (!code || seenActivityCodes.has(code)) return false;
    seenActivityCodes.add(code);
    return true;
  }).map(({ record }) => record);
}
function hideDataDetails() {
  const panel = document.querySelector('#data-search-details');
  if (panel) { panel.hidden = true; panel.replaceChildren(); }
}
function showDataDetails(record) {
  const panel = document.querySelector('#data-search-details');
  panel.replaceChildren();
  panel.className = 'parcel-workspace data-result-workspace';

  const header = document.createElement('div');
  header.className = 'selected-header';
  const pin = document.createElement('span');
  pin.className = 'selected-pin';
  pin.setAttribute('aria-hidden', 'true');
  pin.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
  const copy = document.createElement('div');
  copy.className = 'selected-copy';
  const title = document.createElement('h2');
  title.textContent = record.title;
  const subtitle = document.createElement('p');
  subtitle.textContent = `Información real · ${record.kind}`;
  copy.append(title, subtitle);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'data-detail-close';
  close.setAttribute('aria-label', 'Cerrar detalle');
  close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
  close.addEventListener('click', hideDataDetails);
  header.append(pin, copy, close);
  panel.append(header);

  const body = document.createElement('div');
  body.className = 'workspace-body data-result-body';
  const summary = document.createElement('aside');
  summary.className = 'map-side data-result-summary';
  const summaryTop = document.createElement('div');
  summaryTop.className = 'map-top';
  const summaryLabel = document.createElement('span');
  summaryLabel.textContent = 'FICHA DEL DATO';
  const summaryKind = document.createElement('span');
  summaryKind.textContent = record.kind;
  summaryTop.append(summaryLabel, summaryKind);
  const mark = document.createElement('div');
  mark.className = 'data-result-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
  const code = Object.entries(record.details).find(([label]) => /c[oó]digo|c[oó]d cuadr/i.test(label));
  const summaryTitle = document.createElement('p');
  summaryTitle.className = 'map-address';
  summaryTitle.textContent = code ? String(code[1]) : record.title;
  const summaryCaption = document.createElement('p');
  summaryCaption.className = 'map-caption';
  summaryCaption.textContent = code ? code[0] : 'Registro encontrado en los datos del visor.';
  summary.append(summaryTop, mark, summaryTitle, summaryCaption);

  const content = document.createElement('div');
  content.className = 'module-side';
  const tabs = document.createElement('div');
  tabs.className = 'module-tabs data-result-tabs';
  const tab = document.createElement('span');
  tab.className = 'data-result-tab';
  tab.textContent = record.kind;
  tabs.append(tab);
  const module = document.createElement('div');
  module.className = 'module-panel';
  const heading = document.createElement('div');
  heading.className = 'module-heading';
  const icon = document.createElement('span');
  icon.className = 'module-dot';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
  const headingCopy = document.createElement('div');
  const headingTitle = document.createElement('h3');
  headingTitle.textContent = 'Información del registro';
  const headingDescription = document.createElement('p');
  const visibleCount = Object.keys(record.details).length;
  const extraCount = Object.keys(record.extraDetails || {}).length;
  headingDescription.textContent = extraCount
    ? `${visibleCount} datos principales · ${visibleCount + extraCount} atributos en el registro.`
    : `${visibleCount} atributos disponibles en los datos originales.`;
  headingCopy.append(headingTitle, headingDescription);
  heading.append(icon, headingCopy);

  const fields = document.createElement('dl');
  fields.className = 'module-fields';
  Object.entries(record.details).forEach(([label, value]) => {
    if (value === null || value === undefined || value === '') return;
    const item = document.createElement('div');
    item.className = 'module-field';
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = Array.isArray(value)
      ? value.join(' · ')
      : typeof value === 'object'
        ? Object.entries(value).map(([key, itemValue]) => `${key}: ${itemValue}`).join(' · ')
        : String(value);
    item.append(term, description);
    fields.append(item);
  });
  module.append(heading, fields);
  if (extraCount) {
    const extraDetails = document.createElement('details');
    extraDetails.className = 'data-extra-details';
    const extraSummary = document.createElement('summary');
    extraSummary.textContent = `Ver ${extraCount} atributos complementarios`;
    const extraFields = document.createElement('dl');
    extraFields.className = 'module-fields data-extra-field-grid';
    Object.entries(record.extraDetails).forEach(([label, value]) => {
      if (value === null || value === undefined || value === '') return;
      const item = document.createElement('div');
      item.className = 'module-field';
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = Array.isArray(value)
        ? value.join(' · ')
        : typeof value === 'object'
          ? Object.entries(value).map(([key, itemValue]) => `${key}: ${itemValue}`).join(' · ')
          : String(value);
      item.append(term, description);
      extraFields.append(item);
    });
    extraDetails.append(extraSummary, extraFields);
    module.append(extraDetails);
  }
  const card = cards.find((item) => item.dataset.visorId === record.cardId);
  const link = card?.matches('a[href]') ? card.href : '';
  if (link) {
    const open = document.createElement('a');
    open.className = 'module-open';
    open.href = link;
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    open.textContent = `Abrir visor de ${record.kind} ↗`;
    module.append(open);
  }
  content.append(tabs, module);
  body.append(summary, content);
  panel.append(body);
  panel.hidden = false;
}
function closeAddressSuggestions() {
  addressBox.hidden = true;
  addressInput.setAttribute('aria-expanded', 'false');
}
function syncSearchClear() {
  document
    .querySelector('.address-wrap')
    .classList.toggle('has-query', !!addressInput.value);
}
function showAddressSuggestions() {
  const query = addressInput.value.trim();
  const dataMatches = dataSearchMatches.slice(0, 6);
  const viewerMatches =
    query.length >= 2
      ? cards
          .filter((card) => {
            const terms = normalize(
              `${card.dataset.text || ''} ${card.textContent}`
            );
            const inCategory =
              category === 'todos' ||
              card.dataset.category.split(' ').includes(category);
            const queryTerms = normalizeSearch(query).split(/\s+/).filter(Boolean);
            return inCategory && queryTerms.every((term) => normalizeSearch(terms).includes(term));
          })
          .slice(0, 5)
      : [];
  const recommendations = new Map(viewerMatches.map((card) => [card.dataset.visorId, card]));
  dataMatches.forEach((record) => {
    const card = cards.find((item) => item.dataset.visorId === record.cardId);
    if (card) recommendations.set(card.dataset.visorId, card);
  });
  addressBox.replaceChildren();
  if (recommendations.size) {
    const heading = document.createElement('p');
    heading.className = 'suggestion-group-title';
    heading.textContent = 'Visores recomendados';
    addressBox.append(heading);
  }
  for (const card of [...recommendations.values()].slice(0, 5)) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'address-option viewer-option';
    option.innerHTML = `<span class="option-pin" aria-hidden="true"><i class="fa-solid fa-magnifying-glass"></i></span><span><strong>${card.querySelector('h2').textContent}</strong><small>Ir al visor</small></span><span aria-hidden="true">↗</span>`;
    option.addEventListener('click', () => {
      search.value = card.querySelector('h2').textContent;
      catalogSearchTerm = search.value;
      dataSearchMatches = [];
      dataRecommendationIds.clear();
      hideDataDetails();
      syncSearchClear();
      closeAddressSuggestions();
      render(true).then(() =>
        card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
    });
    addressBox.append(option);
  }
  if (dataMatches.length) {
    const heading = document.createElement('p');
    heading.className = 'suggestion-group-title';
    heading.textContent = 'Coincidencias en los datos';
    addressBox.append(heading);
    for (const record of dataMatches) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'address-option data-option';
      let preview;
      if (record.kind === 'Uso del suelo') {
        const code = record.details['Código de giro'];
        const aliases = record.extraDetails?.['Nombres para buscar'] || [];
        const firstAlias = aliases[0];
        const aliasSummary = firstAlias
          ? `${firstAlias}${aliases.length > 1 ? ` y ${aliases.length - 1} nombres más` : ''}`
          : record.details['Descripción de la clase'];
        preview = [code && `Código ${code}`, aliasSummary].filter(Boolean).join(' · ');
      } else {
        preview = Object.entries(record.details)
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .slice(0, 2)
          .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(' · ') : value}`)
          .join(' · ');
      }
      option.innerHTML = '<span class="option-pin" aria-hidden="true"><i class="fa-solid fa-database"></i></span><span><strong></strong><small></small></span><span aria-hidden="true">↗</span>';
      option.querySelector('strong').textContent = record.title;
      option.querySelector('small').textContent = `${record.kind} · ${preview}`;
      option.addEventListener('click', () => {
        showDataDetails(record);
        closeAddressSuggestions();
        document.querySelector('#data-search-details').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      addressBox.append(option);
    }
  }
  if (!recommendations.size && !dataMatches.length) {
    const message = document.createElement('p');
    message.className = 'address-no-results';
    message.textContent = query
      ? 'No encontramos datos ni un visor relacionado. Prueba otra palabra.'
      : 'Escribe el nombre de una vía, parque, actividad, cuadrante o visor.';
    addressBox.append(message);
  }
  addressBox.hidden = false;
  addressInput.setAttribute('aria-expanded', 'true');
}
document
  .querySelector('#property-search-form')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    if (!addressInput.value.trim()) {
      showAddressSuggestions();
      return;
    }
    if (dataSearchMatches.length) {
      showDataDetails(dataSearchMatches[0]);
      closeAddressSuggestions();
      render(true).then(() => document.querySelector('#data-search-details').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      return;
    }
    catalogSearchTerm = addressInput.value;
    closeAddressSuggestions();
    render(true).then(() => {
      const visibleCards = cards.filter((card) => !card.hidden);
      (
        visibleCards[0] || document.querySelector('.catalog-toolbar')
      ).scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
addressInput.addEventListener('focus', showAddressSuggestions);
addressInput.addEventListener('input', syncSearchClear);
clearSearchButton.addEventListener('click', () => {
  addressInput.value = '';
  dataSearchMatches = [];
  dataRecommendationIds.clear();
  hideDataDetails();
  catalogSearchTerm = '';
  syncSearchClear();
  closeAddressSuggestions();
  render(true);
  addressInput.focus();
});
addressInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAddressSuggestions();
  if (event.key === 'ArrowDown') {
    const firstOption = addressBox.querySelector('.address-option');
    if (firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
  }
});
addressBox.addEventListener('keydown', (event) => {
  const options = [...addressBox.querySelectorAll('.address-option')];
  const current = options.indexOf(document.activeElement);
  if (event.key === 'Escape') {
    closeAddressSuggestions();
    addressInput.focus();
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    options[
      (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
        options.length
    ]?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!document.querySelector('#property-search-form').contains(event.target))
    closeAddressSuggestions();
});
syncSearchClear();
window.loadSearchDataRecords()
  .then((records) => {
    searchDataRecords = records;
    if (addressInput.value.trim()) {
      dataSearchMatches = findDataMatches(addressInput.value);
      dataRecommendationIds = new Set(dataSearchMatches.map((record) => record.cardId));
      if (dataSearchMatches.length) showDataDetails(dataSearchMatches[0]);
      render(false);
      showAddressSuggestions();
    }
  })
  .catch((error) => {
    console.error('No se pudieron cargar los datos de búsqueda desde data/sources/.', error);
    const panel = document.querySelector('#data-search-details');
    if (panel && addressInput.value.trim()) {
      panel.replaceChildren();
      const message = document.createElement('p');
      message.className = 'data-detail-note';
      message.textContent = 'No se pudieron cargar los datos del buscador. Abre el sitio desde un servidor local para consultar sus archivos.';
      panel.append(message);
      panel.hidden = false;
    }
  });

// Replay on every load; use the actual header position on desktop and mobile.
async function playBrandIntro() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const target = document.querySelector('.header .upu-logo');
  if (reducedMotion.matches || !target || !target.animate) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'brand-intro';
  backdrop.setAttribute('aria-hidden', 'true');
  const logo = target.cloneNode();
  logo.className = 'brand-intro-logo';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  const width = Math.min(180, window.innerWidth * 0.45);
  const height = width * (105.49 / 287);
  Object.assign(logo.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${(window.innerWidth - width) / 2}px`,
    top: `${(window.innerHeight - height) / 2}px`,
  });
  document.body.append(backdrop, logo);
  const cleanup = () => {
    target.style.removeProperty('visibility');
    backdrop.remove();
    logo.remove();
  };
  const safetyTimer = setTimeout(cleanup, 3500);
  try {
    await logo.decode();
    target.style.visibility = 'hidden';
    await logo.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 450, easing: 'ease-out', fill: 'forwards' }
    ).finished;
    const destination = target.getBoundingClientRect();
    const origin = logo.getBoundingClientRect();
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: 250,
      duration: 850,
      fill: 'forwards',
      easing: 'ease-in-out',
    });
    await logo.animate(
      [
        { transform: 'translate(0, 0) scale(1, 1)' },
        {
          transform: `translate(${destination.left - origin.left}px, ${destination.top - origin.top}px) scale(${destination.width / width}, ${destination.height / height})`,
        },
      ],
      {
        delay: 250,
        duration: 950,
        easing: 'cubic-bezier(.65,0,.2,1)',
        fill: 'forwards',
      }
    ).finished;
  } catch {
    // The header remains usable if image decoding or animation is interrupted.
  } finally {
    clearTimeout(safetyTimer);
    cleanup();
  }
}
playBrandIntro();
