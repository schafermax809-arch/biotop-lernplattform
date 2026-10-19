// Deliberately faulty practice diagrams. Each correction is grounded in the stated chapters.
export const huntBoards = [
  {
    id: "food",
    title: "Nahrungskette im Wald",
    topics: ["foodweb"],
    intro:
      "Prüfe Pfeilrichtung und Trophiestufen. Drei Elemente des Schaubilds sind falsch.",
    items: [
      {
        id: "leaf",
        label: "Eiche: Produzent",
        correct: true,
        reason: "Die Eiche baut als Produzent organische Stoffe auf.",
      },
      {
        id: "arrow",
        label: "Eichenblatt ← Frostspannerraupe",
        correct: false,
        fix: "Eichenblatt → Frostspannerraupe",
        options: [
          "Eichenblatt → Frostspannerraupe",
          "Eichenblatt ↔ Frostspannerraupe",
          "Eichenblatt — Frostspannerraupe",
        ],
        reason:
          "Nahrungspfeile zeigen in diesem Modell von der Nahrung zum Konsumenten.",
      },
      {
        id: "bird",
        label: "Zilpzalp: Primärkonsument",
        correct: false,
        fix: "Zilpzalp: Sekundärkonsument",
        options: [
          "Zilpzalp: Produzent",
          "Zilpzalp: Sekundärkonsument",
          "Zilpzalp: Tertiärkonsument",
        ],
        reason:
          "In der Kette frisst der Zilpzalp die pflanzenfressende Raupe und ist Sekundärkonsument.",
      },
      {
        id: "hawk",
        label: "Sperber: Sekundärkonsument",
        correct: false,
        fix: "Sperber: Tertiärkonsument",
        options: [
          "Sperber: Primärkonsument",
          "Sperber: Tertiärkonsument",
          "Sperber: Produzent",
        ],
        reason: "Der Sperber frisst in dieser Kette einen Sekundärkonsumenten.",
      },
      {
        id: "chain",
        label: "Raupe → Zilpzalp → Sperber",
        correct: true,
        reason:
          "Die Pfeile stellen die Weitergabe von Nahrung und chemisch gebundener Energie korrekt dar.",
      },
      {
        id: "decay",
        label: "Tote Biomasse → Destruenten",
        correct: true,
        reason:
          "Destruenten können tote organische Substanz aus allen Trophiestufen nutzen.",
      },
    ],
  },
  {
    id: "matter",
    title: "Stoffe und Energie",
    topics: ["spiral", "foodweb"],
    intro:
      "Prüfe die Stoff- und Energiepfade. Drei Beschriftungen verwechseln wichtige Vorgänge.",
    items: [
      {
        id: "sun",
        label: "Wärme → Fotosynthese",
        correct: false,
        fix: "Lichtenergie → Fotosynthese",
        options: [
          "Lichtenergie → Fotosynthese",
          "Mineralstoffe → Energie der Fotosynthese",
          "Zellatmung → Licht der Fotosynthese",
        ],
        reason:
          "Fotosynthese nutzt Lichtenergie. Abgegebene Wärme schließt keinen Energiekreislauf.",
      },
      {
        id: "mineral",
        label: "Mineralisierung: anorganisch → organisch",
        correct: false,
        fix: "Mineralisierung: organisch → anorganisch",
        options: [
          "Mineralisierung: organisch → anorganisch",
          "Mineralisierung: gelöst → fest",
          "Mineralisierung: flussaufwärts → flussabwärts",
        ],
        reason:
          "Bei der Mineralisierung werden organische Stoffe zu anorganischen Stoffen abgebaut.",
      },
      {
        id: "plant",
        label: "Pflanzen: Fotosynthese, keine Zellatmung",
        correct: false,
        fix: "Pflanzen: Fotosynthese und Zellatmung",
        options: [
          "Pflanzen: Fotosynthese und Zellatmung",
          "Pflanzen: Zellatmung nur ohne Mineralstoffe",
          "Pflanzen: Fotosynthese ist ihre Zellatmung",
        ],
        reason:
          "Auch grüne Pflanzen benötigen Zellatmung zur Energiebereitstellung.",
      },
      {
        id: "flow",
        label: "Strömung → Transport flussabwärts",
        correct: true,
        reason:
          "Räumliche Verlagerung ergänzt die biologische Stoffumwandlung zur Stoffspirale.",
      },
      {
        id: "dead",
        label: "Tote organische Substanz → Destruenten",
        correct: true,
        reason: "Tote Biomasse liefert Material für Abbau und Mineralisierung.",
      },
      {
        id: "co2",
        label: "CO₂ und Wasser → Aufbau organischer Stoffe",
        correct: true,
        reason:
          "Diese anorganischen Ausgangsstoffe werden bei der Fotosynthese unter Nutzung von Licht eingesetzt.",
      },
    ],
  },
  {
    id: "river",
    title: "Vom Ursprung zur Mündung",
    topics: ["river"],
    intro:
      "Das Schaubild soll das vereinfachte Flussmodell der Mappe wiedergeben. Finde drei vertauschte Eigenschaften.",
    items: [
      {
        id: "source",
        label: "Quelle: hoher Sauerstoffgehalt",
        correct: false,
        fix: "Quelle: zunächst geringer Sauerstoffgehalt",
        options: [
          "Quelle: zunächst geringer Sauerstoffgehalt",
          "Quelle: stärkste O₂-Tagesschwankung",
          "Quelle: höherer O₂-Gehalt als im Oberlauf",
        ],
        reason:
          "Die Mappe beschreibt an der Quelle zunächst wenig Sauerstoff; im Oberlauf steigt er an.",
      },
      {
        id: "bed",
        label: "Oberlauf: Sand und Feinsediment",
        correct: false,
        fix: "Oberlauf: Steine und Kies",
        options: [
          "Oberlauf: Steine und Kies",
          "Oberlauf: Sand und Schluff",
          "Oberlauf: Detritus statt Gewässergrund",
        ],
        reason:
          "Starke Strömung transportiert feines Material weiter; der Oberlauf besitzt grobes Substrat.",
      },
      {
        id: "light",
        label: "Trüber Unterlauf: viel Licht am Grund",
        correct: false,
        fix: "Trüber Unterlauf: wenig Licht am Grund",
        options: [
          "Trüber Unterlauf: wenig Licht am Grund",
          "Trüber Unterlauf: hohe Fotosynthese am Grund",
          "Trüber Unterlauf: mehr Aufwuchsalgen als im Mittellauf",
        ],
        reason:
          "Trübstoffe verringern die Lichtdurchdringung und begrenzen Fotosynthese am Grund.",
      },
      {
        id: "mid",
        label: "Mittellauf: Mäander",
        correct: true,
        reason:
          "Weite Flussschleifen sind im beschriebenen Mittellauf typisch.",
      },
      {
        id: "velocity",
        label: "Gefälle und Strömung nehmen im Modell ab",
        correct: true,
        reason: "Das Längsprofil der Mappe zeigt eine Abnahme flussabwärts.",
      },
      {
        id: "fluctuate",
        label: "Mittellauf: hohe, aber schwankende O₂-Werte",
        correct: true,
        reason:
          "Der Mittellauf weist ausgeprägte Tages- und Jahresschwankungen auf.",
      },
    ],
  },
  {
    id: "niche",
    title: "Konkurrenz und Nische",
    topics: ["terms"],
    intro:
      "Ordne das Seeepocken-Beispiel und die Begriffe korrekt ein. Drei Beschriftungen stimmen nicht.",
    items: [
      {
        id: "place",
        label: "Ökologische Nische = Aufenthaltsort",
        correct: false,
        fix: "Ökologische Nische = Ansprüche und Beziehungen",
        options: [
          "Ökologische Nische = Ansprüche und Beziehungen",
          "Ökologische Nische = Artenzahl am Ort",
          "Ökologische Nische = Größe einer Population",
        ],
        reason:
          "Die Nische ist kein bloßer Ort, sondern umfasst Ansprüche, Ressourcennutzung und Beziehungen.",
      },
      {
        id: "competition",
        label: "Reale Nische: ohne einschränkende Konkurrenz",
        correct: false,
        fix: "Reale Nische: unter biotischen Wechselwirkungen",
        options: [
          "Reale Nische: unter biotischen Wechselwirkungen",
          "Reale Nische: ohne abiotische Umweltfaktoren",
          "Reale Nische: gesamte physiologische Möglichkeit",
        ],
        reason:
          "Die tatsächlich genutzte Nische wird im Konkurrenzmodell durch andere Arten eingeschränkt.",
      },
      {
        id: "same",
        label: "Innerhalb einer Art: interspezifische Konkurrenz",
        correct: false,
        fix: "Innerhalb einer Art: intraspezifische Konkurrenz",
        options: [
          "Innerhalb einer Art: intraspezifische Konkurrenz",
          "Innerhalb einer Art: Kommensalismus",
          "Innerhalb einer Art: fundamentale Nische",
        ],
        reason:
          "Intraspezifisch bedeutet innerhalb derselben Art; interspezifisch zwischen verschiedenen Arten.",
      },
      {
        id: "remove",
        label: "Semibalanus entfernen → Chthamalus kann tiefer siedeln",
        correct: true,
        reason:
          "Die Konkurrenzbegrenzung entfällt; grundsätzlich geeignete tiefere Bereiche können genutzt werden.",
      },
      {
        id: "dry",
        label: "Trockenfallen begrenzt Semibalanus nach oben",
        correct: true,
        reason: "Semibalanus ist laut Mappe empfindlicher gegen Austrocknung.",
      },
      {
        id: "multi",
        label: "Nischenmodell: mehrere Umweltfaktoren",
        correct: true,
        reason:
          "Temperatur, Salzgehalt und Feuchte sind beispielhafte Dimensionen eines vereinfachten Modells.",
      },
    ],
  },
];
