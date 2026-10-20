/* Loads the original user-provided datasets and builds the browser search index. */
(function attachSearchDataLoader(global) {
  const SOURCE_FILES = {
    soterrados: 'data/sources/Inventario2026_0.js',
    parques: 'data/sources/ParquesOf_5.js',
    actividades: 'data/sources/indice_distrital_actual.js',
    vias: 'data/sources/red_vial_0.js',
    slo: 'data/sources/CuadranteSLO100mx100m_2.js',
  };

  function extractAssignedJson(source, variableName) {
    const assignment = new RegExp(`\\b(?:var|let|const)\\s+${variableName}\\s*=\\s*`);
    const match = assignment.exec(source);
    if (!match) throw new Error(`No se encontró ${variableName} en su archivo de datos.`);
    let start = match.index + match[0].length;
    while (/\s/.test(source[start] || '')) start += 1;
    const opening = source[start];
    if (opening !== '{' && opening !== '[') throw new Error(`Formato de datos no válido para ${variableName}.`);

    const stack = [];
    let quote = '';
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = '';
        continue;
      }
      if (character === '"') {
        quote = character;
        continue;
      }
      if (character === '{' || character === '[') stack.push(character);
      else if (character === '}' || character === ']') {
        const expected = character === '}' ? '{' : '[';
        if (stack.pop() !== expected) throw new Error(`Estructura inválida en ${variableName}.`);
        if (!stack.length) return JSON.parse(source.slice(start, index + 1));
      }
    }
    throw new Error(`No se pudo leer completo ${variableName}.`);
  }

  function flattenValues(value) {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) return value.flatMap(flattenValues);
    if (typeof value === 'object') return Object.values(value).flatMap(flattenValues);
    return [String(value)];
  }

  const ignoredShapeMetadata = new Set([
    'descriptio', 'timestamp', 'begin', 'end', 'altitudemo', 'tessellate',
    'extrude', 'visibility', 'draworder', 'icon',
  ]);

  function featureDetails(properties, kind) {
    const details = {};
    Object.entries(properties || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || ignoredShapeMetadata.has(key.toLocaleLowerCase('es'))) return;
      if (kind === 'Soterrados' && key === 'Name') details.Código = value;
      else details[key] = value;
    });
    return details;
  }

  function featureRecords(collection, kind, cardId, titleFor, detailsFor = null, extraDetailsFor = null) {
    if (!collection || !Array.isArray(collection.features)) throw new Error(`La fuente ${kind} no contiene registros geográficos.`);
    return collection.features.map((feature) => {
      const properties = feature.properties || {};
      const title = titleFor(properties);
      const sourceDetails = featureDetails(properties, kind);
      return {
        kind,
        cardId,
        title: String(title || `${kind} sin nombre`),
        details: detailsFor ? detailsFor(properties, sourceDetails) : sourceDetails,
        ...(extraDetailsFor ? { extraDetails: extraDetailsFor(properties, sourceDetails) } : {}),
        search: flattenValues(properties).join(' '),
      };
    });
  }

  function activityRecords(rows) {
    if (!Array.isArray(rows)) throw new Error('El índice de actividades no contiene una lista válida.');
    return rows.map((activity) => {
      const zones = activity.ZONAS || {};
      const compatibleZones = Object.entries(zones)
        .filter(([, value]) => value && value !== 'X' && value !== 'No')
        .map(([zone, value]) => `${zone}: ${value}`);
      const allowedZones = Object.entries(zones)
        .filter(([, value]) => value === 'X' || value === true || value === 'Sí')
        .map(([zone]) => zone);
      const details = {
        'Código de giro': activity.COD_GIRO,
        'Descripción de la clase': activity['DESCRIPCIÓN DE LA CLASE'],
        'Zonas compatibles': allowedZones.length ? allowedZones.join(' · ') : compatibleZones.join(' · '),
      };
      const extraDetails = {
        'Nombres para buscar': activity.NOMBRES_PARA_EL_VISOR,
        'Equivalencia CIIU': activity.EQUIVALENCIA_REV3,
        'Actividad CIIU equivalente': activity.NOMBRE_GIRO_EQUIVALENTE_REV3,
        Observaciones: activity.OBSERVACIONES,
      };
      Object.keys(details).forEach((key) => {
        if (details[key] === null || details[key] === undefined || details[key] === '') delete details[key];
      });
      Object.keys(extraDetails).forEach((key) => {
        if (extraDetails[key] === null || extraDetails[key] === undefined || extraDetails[key] === '') delete extraDetails[key];
      });
      return {
        kind: 'Uso del suelo',
        cardId: 'usos',
        title: String(activity.ACTIVIDAD || activity['DESCRIPCIÓN DE LA CLASE'] || 'Actividad urbana'),
        details,
        extraDetails,
        search: flattenValues(activity).join(' '),
      };
    });
  }

  async function loadSearchDataRecords() {
    const entries = await Promise.all(Object.entries(SOURCE_FILES).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar el archivo de datos: ${url}`);
      return [key, await response.text()];
    }));
    const sourceText = Object.fromEntries(entries);
    const soterrados = extractAssignedJson(sourceText.soterrados, 'json_Inventario2026_0');
    const parques = extractAssignedJson(sourceText.parques, 'json_ParquesOf_5');
    const vias = extractAssignedJson(sourceText.vias, 'json_red_vial_0');
    const slo = extractAssignedJson(sourceText.slo, 'json_CuadranteSLO100mx100m_2');
    const actividades = extractAssignedJson(sourceText.actividades, 'datosActividadesIndice');

    return [
      ...activityRecords(actividades),
      ...featureRecords(
        parques,
        'Espacios públicos',
        'espacios',
        (properties) => properties.NOMBRE,
        (properties) => ({
          Código: properties['CÓDIGO'],
          Sector: properties.sector,
          'Área del parque (m²)': properties['ÁREA'],
          Clasificación: properties.CLASIFICAC,
          'Tipo de área urbana': properties['ATU DETALL'] || properties.ATU,
          'Área verde requerida': properties['AREA VERDE'],
          Ocupación: `${properties['%OCUP_VERD'] ?? '—'}% verde · ${properties['%OCUP_GRIS'] ?? '—'}% gris`,
          'Altura máxima (m)': properties['ALT_MAX(m)'],
        }),
        (properties, sourceDetails) => {
          const primaryFields = new Set([
            'CÓDIGO', 'sector', 'ÁREA', 'CLASIFICAC', 'ATU DETALL', 'ATU',
            'AREA VERDE', '%OCUP_VERD', '%OCUP_GRIS', 'ALT_MAX(m)',
          ]);
          return Object.fromEntries(Object.entries(sourceDetails).filter(([key]) => !primaryFields.has(key)));
        }
      ),
      ...featureRecords(vias, 'Movilidad', 'vias', (properties) => properties.NOMBRE_FIN),
      ...featureRecords(soterrados, 'Soterrados', 'soterrados', (properties) => properties.Name),
      ...featureRecords(slo, 'SLO', 'slo', (properties) => `Cuadrante ${properties['Cód_Cuadr'] || ''}`),
    ];
  }


  global.loadSearchDataRecords = loadSearchDataRecords;
})(window);
