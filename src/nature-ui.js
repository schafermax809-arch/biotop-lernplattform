// Illustrations are schematic, deliberately not photographic or measurement plots.
export function riverScene(
  { light = 2, turbidity = 2, vegetation = 2, temp = 15 } = {},
  key = "river",
) {
  const foliage = Math.max(1, Math.min(3, vegetation));
  const rayOpacity = Math.max(
    0.08,
    0.16 + light * 0.12 - turbidity * 0.045 - foliage * 0.025,
  );
  const plants = [48, 115, 184, 595, 655, 735]
    .map(
      (x, i) =>
        `<g transform="translate(${x} ${456 - (i % 3) * 12})" stroke="${i % 2 ? "#a4bc72" : "#78a56b"}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M0 12Q-18-42 1-106M0-15Q-35-37-25-67M0-44Q30-64 26-89"/><path d="M0-12Q30-25 31-50M-1-66Q-20-72-22-91" stroke-width="4"/></g>`,
    )
    .join("");
  const trees = Array.from({ length: 10 }, (_, i) => {
    const x = 18 + i * 83,
      y = 144 + (i % 3) * 12;
    return `<g transform="translate(${x} ${y})"><path d="M0 48V-12" stroke="#64794a" stroke-width="7"/><path d="M-22 23 0-33 23 23Z" fill="${i % 2 ? "#567f59" : "#749866"}"/><path d="M-18 8 0-43 18 8Z" fill="#7d9c67"/></g>`;
  }).join("");
  const stones = Array.from({ length: 15 }, (_, i) => {
    const x = 15 + i * 58,
      y = 465 + (i % 3) * 9;
    return `<path d="M${x - 21} ${y}q2-22 23-21t29 21Z" fill="${["#76857b", "#a9b2a0", "#c1c2a1"][i % 3]}"/><path d="m${x - 15} ${y - 7}q14-18 31-6" stroke="#d7d5b1" stroke-width="3" opacity=".45"/>`;
  }).join("");
  const canopy = Array.from({ length: foliage * 5 }, (_, i) => {
    const x = 740 - (i % 5) * 66,
      y = 35 + Math.floor(i / 5) * 37;
    return `<ellipse cx="${x}" cy="${y}" rx="${52 + (i % 2) * 8}" ry="${23 + (i % 3) * 5}" transform="rotate(${-22 + (i % 4) * 15} ${x} ${y})" fill="${["#4d773f", "#78974d", "#96ab5d"][i % 3]}"/>`;
  }).join("");
  const particles = Array.from(
    { length: turbidity * 12 },
    (_, i) =>
      `<circle cx="${30 + ((i * 109) % 740)}" cy="${263 + ((i * 41) % 181)}" r="${1.4 + (i % 3) * 0.6}" fill="#d0bd88" opacity=".46"/>`,
  ).join("");
  return `<svg class="river-scene-svg" viewBox="0 0 800 500" role="img" aria-labelledby="${key}-title"><title id="${key}-title">Illustriertes Flussmodell: Licht ${light} von 3, Trübung ${turbidity} von 3, Uferbewuchs ${vegetation} von 3. Temperatur ${temp} Grad Celsius; deren Löslichkeitseffekt steht in der Auswertung.</title><defs><linearGradient id="${key}-sky" x2="0" y2="1"><stop stop-color="#6aafba"/><stop offset="1" stop-color="#d2dfae"/></linearGradient><linearGradient id="${key}-water" x2="0" y2="1"><stop stop-color="#458f91"/><stop offset="1" stop-color="#244f52"/></linearGradient><clipPath id="${key}-waterclip"><path d="M0 218Q185 201 400 220T800 218V500H0Z"/></clipPath></defs>
    <rect width="800" height="500" fill="url(#${key}-sky)"/><circle cx="149" cy="72" r="35" fill="#ecdf9c" opacity="${0.4 + light * 0.17}"/><path d="M0 174 120 79 235 170 355 106 495 169 642 87 800 166V231H0Z" fill="#8faa8e"/><path d="M0 201 163 135 275 195 430 146 560 196 725 133 800 185V237H0Z" fill="#6a927b"/>
    ${trees}<path d="M0 217Q156 164 285 215L345 239H0Z" fill="#8e9c6c"/><path d="M800 211Q652 174 520 215L462 240H800Z" fill="#839065"/>
    <path d="M0 219Q200 202 400 220T800 218V500H0Z" fill="url(#${key}-water)"/>
    <g clip-path="url(#${key}-waterclip)"><path d="m88 194 47 0 165 306H5ZM280 195h33l170 305H358ZM491 191h36l122 309H551" fill="#eff2b2" opacity="${rayOpacity}"/>
    <path d="M0 475Q180 412 380 455T800 443V500H0Z" fill="#859179"/><path d="M0 493Q185 441 410 480T800 468V500H0Z" fill="#b3b18b"/>
    ${plants}${stones}<g fill="#1c5554" opacity=".8"><path d="M296 326q27-23 59-1l16-10v23l-16-11q-32 19-59-1Z"/><path d="M456 366q21-19 49-1l13-8v20l-13-10q-27 16-49-1Z"/></g>
    <rect y="220" width="800" height="280" fill="#a39663" opacity="${(turbidity - 1) * 0.14}"/>${particles}</g>
    <path d="M0 218Q185 201 400 220T800 218" stroke="#b8dfc9" stroke-width="5" fill="none"/><g stroke="#d4e6c5" stroke-width="3" opacity=".65"><path d="M47 234h108m138-11 94 3m152 10 87-4m75-10h57"/></g>
    <path d="M800 203Q740 111 635 22M772 141Q689 131 602 65" stroke="#5b6841" stroke-width="${8 + foliage * 3}" fill="none"/>${canopy}
  </svg>`;
}

export function levelIllustration(index) {
  if (index === 4)
    return `<svg viewBox="0 0 240 135" aria-hidden="true"><circle cx="120" cy="66" r="51" fill="#407c80"/><path d="m95 22 28-7 28 14-6 22-23-2-17 19-26-11 2-20Zm37 54 30-6 9 22-24 23-18-9Z" fill="#a6bd78"/><ellipse cx="120" cy="66" rx="51" ry="18" fill="none" stroke="#bdd4a0" opacity=".45"/><ellipse cx="120" cy="66" rx="24" ry="51" fill="none" stroke="#bdd4a0" opacity=".45"/></svg>`;
  const fish = (x, y, scale = 1) =>
    `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-28 0Q-4-24 26 0Q-4 23-28 0L-41-15V14Z" fill="#b5c48b"/><path d="m-4-12 6-9 8 9" fill="#799c6c"/><circle cx="16" cy="-2" r="2.3" fill="#143b35"/></g>`;
  return `<svg viewBox="0 0 240 135" aria-hidden="true"><rect width="240" height="135" rx="12" fill="#1d4947"/><path d="M0 29Q60 18 120 29T240 29" stroke="#67a6a0" fill="none" stroke-width="3"/>${index === 0 ? fish(125, 75, 1.2) : fish(73, 60, 0.8) + fish(157, 76, 0.9) + fish(98, 102, 0.7)}${index >= 2 ? '<g stroke="#82a65e" stroke-width="4" fill="none"><path d="M28 135Q15 94 28 52m0 51-12-17m12 4 15-21M207 135q-16-40 0-75m-3 35 16-20"/></g><path d="M167 118q-5-15 10-18t17 18Z" fill="#a5a77d"/><circle cx="180" cy="109" r="7" fill="#6e8b62"/>' : ""}${index >= 3 ? '<path d="m0 135 16-20 24 4 15 16m132 0 11-20 23 3 19 17" fill="#8f9d85"/><circle cx="209" cy="19" r="10" fill="#ded595"/><path d="m201 31-10 35m20-35-4 30" stroke="#ded595" stroke-width="2" opacity=".6"/>' : ""}</svg>`;
}
