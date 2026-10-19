# Biotop – deine Biologie-Lernplattform

**Website:** [Biotop online öffnen](https://schafermax809-arch.github.io/biotop-lernplattform/)

**Repository:** [schafermax809-arch/biotop-lernplattform](https://github.com/schafermax809-arch/biotop-lernplattform)

Ein vollständiges, lokal nutzbares Webprojekt zur Ökologie-Klausur in der Oberstufe. HTML, CSS und JavaScript ohne Framework, externe Schriftarten, API-Schlüssel oder Datenbank.

## In VS Code starten

1. Diesen Ordner in VS Code öffnen: **Datei → Ordner öffnen**.
2. **Terminal → Neues Terminal** öffnen.
3. `npm start` eingeben. Alternativ funktioniert `node server.mjs`.
4. [http://127.0.0.1:4173](http://127.0.0.1:4173) im Browser öffnen.

Voraussetzung: Node.js ab Version 20. Auf diesem Rechner ist der gebündelte Codex-Node-Runtime verfügbar. Unter Windows kannst du auch **Start-Biotop.cmd** doppelt anklicken; das Skript sucht Node im PATH und anschließend an diesem gebündelten Installationsort. Das Terminal bleibt während der Nutzung offen. Mit **Strg+C** beenden.

Eine weitere Möglichkeit ist die VS-Code-Erweiterung **Live Server**: `index.html` per „Open with Live Server“ öffnen. Der direkte Doppelklick auf `index.html` reicht wegen der JavaScript-Module und JSON-Lerninhalte nicht aus.

## Enthalten

- Zehn Lernkapitel mit Erklärungen, Definitionen, Merksätzen, Quellen und Verständnischecks.
- 150 eigenständige Aufgaben, 15 pro Thema: Einzelauswahl, Mehrfachauswahl, Richtig/Falsch mit eigener Begründung, Lückentexte, Reihenfolge mit Drag & Drop und Pfeiltasten, Zuordnung, offene Aufgaben und Diagrammanalyse.
- Drei Schwierigkeiten und AFB I–III, Musterlösungen und Bewertungskriterien.
- Elf interaktive Module: die sieben bisherigen Module plus Ökosystem-Sandbox, Nahrungsnetz-Domino, Nischen-Arena und Fehlerjagd in Schaubildern.
- Persönlicher Lernplan mit Klausurdatum, täglichem Minutenbudget und priorisierten Themen.
- Operatoren-Trainer mit sechs Operatoren und zwölf zusätzlichen offenen Aufgaben.
- Eigene Kapitelnotizen, Auswahlmarkierungen und ein durchsuchbares Notizheft.
- Kriterien-Checklisten berechnen Teilpunkte in Übungen und nach Klausurabgabe.
- Klausursimulation mit 30/45/60/90 Minuten, 10/20 ausgewogen verteilten Aufgaben, Zeitablauf, Abgabe und nachträglicher Bewertung. Eine laufende Klausur wird bei Neuladen wiederhergestellt; die Zeit läuft während des Verlassens weiter.
- Karteikarten mit Umdrehanimation und Wiederholungsintervallen; unsichere Karten kommen nach einem Tag, sichere nach 1, 3, 7, 14, 30 und 60 Tagen wieder. „Kann ich nicht“ bleibt sofort fällig.
- Dashboard, Fehlertraining, Lesezeichen, Schnelltest, Glossarsuche, Themenfilter, Fokusmodus, optionaler Ton und Sitzungsstatistik.
- Lokale Speicherung und validierter JSON-Export/Import.

## Die acht neuen Funktionen nutzen

1. **Lernplan:** Unter „Lernplan“ Klausurdatum und tägliche Lernzeit (5–180 Minuten) eingeben. Die Planung beginnt heute und reicht bis zum Tag vor der Klausur; bei einer Klausur heute gibt es einen heutigen Kurzplan. Fehler und unsichere Themen haben Vorrang. Tagesbudgets werden eingehalten, Aufgaben sind direkt verlinkt und werden nach der Bearbeitung selbst abgehakt. Zukünftige Tage sind einklappbar. „Plan neu berechnen“ erstellt ab heute einen Plan mit aktuellem Lernstand und ersetzt die bisherigen Planhäkchen nach Bestätigung. Der fachliche Lernfortschritt bleibt erhalten. Einträge sind für höchstens ein Jahr möglich.
2. **Operatoren-Trainer:** Nennen, Beschreiben, Erklären, Vergleichen, Analysieren und Beurteilen unterscheiden, eigene Antworten formulieren und anhand der Kriterien bewerten. Die Definitionen beruhen auf IQB und dem niedersächsischen Kerncurriculum. Der Anforderungsbereich hängt von der konkreten Aufgabe ab. Operatoren-Ergebnisse werden separat vom bisherigen 150-Aufgaben-Katalog gezählt.
3. **Kriterien-Checkliste:** In offenen Übungen und nach Klausurabgabe die erfüllten Kriterien abhaken; die Summe wird unmittelbar angezeigt. „Bewertung speichern“ verbucht die Punkte. Keine Häkchen bedeutet null Punkte. In einer laufenden Klausur sind Kriterien und Musterlösung weiterhin verborgen.
4. **Notizen & Markierungen:** Im Kapitel die eigene Notiz schreiben; sie wird sofort gespeichert. Innerhalb eines Erklärungsabsatzes Text auswählen und „Auswahl markieren“ anklicken. Überlappende Markierungen werden zusammengeführt. Einzelne Markierungen lassen sich per × entfernen. „Meine Notizen“ durchsucht Notizen und markierte Zitate kapitelübergreifend. Die Original-PDF wird dabei nicht verändert.
5. **Ökosystem-Sandbox:** Licht, Trübung, Uferbewuchs und Temperatur verändern. Das Modell vergleicht qualitative Wirkungen mit dem Ausgangszustand. Gegenläufige Einflüsse werden ausdrücklich als uneindeutig behandelt. Sauerstofflöslichkeit ist vom tatsächlichen Sauerstoffgehalt zu unterscheiden.
6. **Nahrungsnetz-Domino:** Rückgang oder Zunahme einer Nahrungsquelle auswählen, direkte Folgen für Nahrung oder Fraßdruck einordnen und mögliche indirekte Folgen begründen. Die Auswirkungen sind begründete Möglichkeiten; es werden keine Populationsgrößen berechnet.
7. **Nischen-Arena:** Semibalanus aus einer Versuchsfläche entfernen beziehungsweise wieder einsetzen. Mit der unveränderten Kontrollfläche und der eingeblendeten fundamentalen Nische von Chthamalus vergleichen. Zonen sind schematisch, nicht maßstäbliche Messungen.
8. **Fehlerjagd:** Vier Schaubilder mit je drei Fehlern in Pfeilen oder Beschriftungen reparieren. Die visuellen Elemente oder nummerierten Beschriftungen anklicken und eine Korrektur auswählen. Richtige Reparaturen bleiben gespeichert; ein Schaubild kann gezielt zurückgesetzt werden.

## Quellen und fachliche Entscheidungen

Die 29-seitige Originalmappe wurde als Quelle ausgewertet und wird auf Wunsch nicht mit der Website oder im Repository bereitgestellt. Seitenangaben verweisen auf das eigene Exemplar. Die Angaben „PDF S. …“ zählen ab der ersten PDF-Seite, unabhängig von den gedruckten Arbeitsblattnummern. Die Mappe wurde vollständig einschließlich Abbildungen und Handschrift gesichtet.

Ergänzungen schließen die ursprünglich festgestellten Lücken, entsprechend der ausdrücklichen Erlaubnis, verlässliche externe Quellen zu verwenden. Sie sind in den Kapiteln mit **Ergänzung** gekennzeichnet und verlinkt. Dazu gehören OpenStax/Rice University, NASA/GLOBE, ESA, Umweltbundesamt, Bundeszentrale für politische Bildung, KIT, weitere Hochschulen sowie Originalstudien. Ein Quellenverzeichnis steht in `QUELLEN.md`; die Verknüpfungen zu jedem Kapitel stehen in `src/content.json`.

Wichtige Präzisierungen:

- Das konkrete Ecosphere-Unterrichtsmodell ist nicht beschrieben. Das Kapitel und Modul verwenden ausdrücklich ein allgemeines, stofflich idealisiert geschlossenes und energetisch offenes Modell. Ein bestimmtes Klassenexperiment wird nicht behauptet.
- Physiologische Potenz bedeutet keine Abwesenheit von Umweltfaktoren. Die uneindeutige Handschrift wurde mit einer Hochschulquelle präzisiert.
- Pflanzen betreiben neben Fotosynthese auch Zellatmung. Die vereinfachten handschriftlichen Stofftabellen werden entsprechend eingeordnet.
- Die Bergmann-/Allen-Regeln sind Tendenzen unter geeigneten Vergleichsbedingungen. Der Elefant wird als Grenze einer pauschalen Anwendung, nicht als sauberer alleiniger Gegenbeweis dargestellt.
- Mutualismus und Symbiose werden je nach Quelle unterschiedlich abgegrenzt. Aufgaben mit begründbar mehreren Begriffskonventionen werden offen und anhand der Wirkungen bewertet.
- Hypothetische Messreihen und qualitative Modelle sind in den Aufgaben ausdrücklich benannt. Sie werden nicht als Messwerte der Mappe ausgegeben.
- Strukturlegen, Saprobienindex und zusätzliche Pflanzenanatomie sind keine eigenen Klausurthemen dieser Plattform.

## Bewertung und Fortschritt

Geschlossene Aufgaben werden nach ihrer fachlichen Lösung bewertet. Mehrfachauswahl, Zuordnung und Reihenfolge erfordern die vollständig richtige Lösung; es gibt dabei keine Teilpunkte. Bei Richtig/Falsch wird die Wahl automatisch geprüft; die eigene Begründung vergleichst du mit der Erklärung.

Freitext und Diagrammdeutungen werden **nicht über Schlüsselwörter automatisch benotet**. Nach dem Vergleich mit der Musterlösung hakst du die erfüllten Kriterien ab. Die Plattform berechnet daraus die Punkte: ein Punkt pro erfülltem Kriterium. Das gilt in der Klausur erst nach der Abgabe. Erst wenn alle offenen Antworten bewertet sind, wird eine Klausur im Lernfortschritt und in der Sitzungsstatistik verbucht. Unbeantwortete Klausuraufgaben erhalten null Punkte.

Der Themenfortschritt ist der Anteil der Aufgaben, die du **zuletzt vollständig richtig** gelöst hast. Eine spätere falsche Antwort macht sie wieder zum Fehlertraining. Die Zähler für richtige und falsche Antworten berücksichtigen alle Versuche. „Kapitel gelesen“ ist separat und vergibt keine richtigen Antworten.

Ein schulischer Notenschlüssel ist nicht bekannt und wurde nicht erfunden. Unter Einstellungen kannst du 16 streng absteigende untere Prozentgrenzen für 15 bis 0 Notenpunkte hinterlegen; die letzte Grenze ist 0. Ohne diesen Schlüssel gibt es Punkte und Prozentwerte.

## Speicherung und Sicherung

Fortschritt liegt im `localStorage` deines Browsers unter `biotop-progress-v1`. Eine andere Adresse, ein anderer Port oder Browser hat einen eigenen Speicher. Auch ein späterer Umzug zu GitHub Pages übernimmt die Daten deshalb nicht automatisch.

Vor einem Wechsel unter **Einstellungen → JSON exportieren** sichern und am neuen Ort wieder importieren. Der Import zeigt vor dem Ersetzen die erkannten Daten und erfordert Bestätigung. Er übernimmt Antworten, Karten, Lesezeichen, gelesene Kapitel, Statistiken, Einstellungen, Lernplan, Notizen, Markierungen, Operatoren-Bewertungen und gespeicherte Laborschritte; eine laufende Klausur wird bewusst nicht importiert. Das Zurücksetzen erfordert ebenfalls eine Bestätigung. Sitzungsstatistiken speichern die letzten 100 Sitzungen.

## Dateien

```text
index.html           Einstieg
src/app.js           Navigation und Lernoberfläche
src/engine.js        Antwortprüfung, Fortschritt, Import und Wiederholung
src/labs.js          Sieben grundlegende Lernmodule
src/advanced-labs.js  Vier zusätzliche Experimente
src/hunt-diagrams.js Anklickbare Schaubilder zur Fehlerjagd
src/hunt-data.js     Fehler und fachliche Korrekturen
src/learning-tools.js Lernplan, Notizen, Operatoren, Checklisten
src/tools-engine.js  Kalender, Planung, Import und qualitative Modelle
src/operators.json   Operatoren und zwölf Aufgaben mit Quellen
src/content.json     Alle Lerninhalte, Quellen, Aufgaben und Lösungen
src/styles.css       Responsive Gestaltung
assets/              Logo
server.mjs           Kleiner lokaler Webserver
tests/               Fachliche Daten- und Funktionstests
```

## Prüfen

`npm test` oder `node --test tests/engine.test.mjs tests/tools.test.mjs` prüft den gesamten Fragenkatalog, Musterantworten, Fehlerzähler, Wiederholungsintervalle, ausgeglichene Klausurzusammenstellung und JSON-Rundreise sowie die neuen Lernwerkzeuge und qualitativen Modelle. 20 Tests, keine Zusatzpakete erforderlich.

Für die optionalen Browsertests: Playwright verfügbar machen, den lokalen Server starten und `node tests/browser.cjs` sowie `node tests/features-browser.cjs` ausführen. Unter Windows mit installiertem Edge in PowerShell zuerst `$env:BROWSER_CHANNEL='msedge'` setzen. Falls Playwright außerhalb des Projekts installiert ist, kann `PLAYWRIGHT_MODULE` auf den Modulordner zeigen. `QA_DIR` aktiviert Screenshots. Details der durchgeführten Prüfung stehen in `TESTBERICHT.md`.

## Veröffentlichung auf GitHub Pages

Die Anwendung ist vollständig statisch und benötigt keinen Build-Schritt. Den Inhalt dieses Ordners in ein Repository übernehmen. Unter **Settings → Pages → Deploy from a branch** den gewünschten Branch und **/(root)** auswählen. Relative Ressourcenpfade funktionieren auch unter einer Projekt-Unteradresse. `server.mjs`, Tests und Startskript werden auf GitHub Pages nicht benötigt. `.nojekyll` ist bereits enthalten.

Dieses Projekt wird aus dem Branch `main` und dem Stammverzeichnis über GitHub Pages veröffentlicht. Die lokale Nutzung ist weiterhin möglich. Die PDF ist nicht enthalten. Die Originaldatei auf E: bleibt unverändert.
