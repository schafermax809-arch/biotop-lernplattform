# Durchgeführte Prüfung

Stand: 19. Oktober 2026. Lokal mit Node.js und Microsoft Edge über Playwright geprüft. Die Tests nutzten ein separates Browserprofil; sie legen keinen Beispiel-Lernfortschritt im ausgelieferten Projekt ab.

## Automatische Daten- und Logiktests

**20 Tests bestanden.**

- Zehn Themen mit genau 15 Fragen: insgesamt 150 eindeutige Aufgaben.
- Antwortoptionen und korrekte Lösungen für den gesamten Katalog validiert.
- Jede objektive Musterantwort wird akzeptiert; falsche, leere und überzählige Antworten werden zurückgewiesen.
- Freitext wird ausdrücklich als Selbstbewertung behandelt.
- Fortschritt, letzte richtige Antwort, kumulierte Versuche und Fehlertraining geprüft.
- Punktzahlen werden auf den zulässigen Bereich begrenzt.
- Wiederholungsintervalle und Rückstufung unsicherer Karten geprüft.
- 10-/20-Aufgaben-Klausurpools wiederholt auf Gleichverteilung und fehlende Duplikate geprüft.
- JSON-Rundreise und Zurückweisung ungültiger Daten geprüft.
- Mischen verändert die Ausgangsdaten nicht.

## Browserprüfung

**Alle aufgeführten Abläufe bestanden; keine JavaScript-Laufzeitfehler beobachtet.**

- Dashboard startet ohne erfundene Fortschrittswerte.
- Alle acht Aufgabentypen beantwortet und bewertet, einschließlich Selbstbewertung.
- Fehler, Lesezeichen und abgeschlossene Sitzungen gespeichert.
- Karte umgedreht, bewertet und Speicherung durch Neuladen überprüft.
- Alle elf interaktiven Module bedient und deren Rückmeldungen geprüft.
- Nahrungsnetz und Reihenfolge zusätzlich mit echtem Browser-Drag-and-Drop geprüft.
- Klausur über alle zehn Themen mit AFB I, II und III erzeugt.
- Während der Klausur keine Musterlösungen oder Feedbackelemente angezeigt.
- Vollständige Klausur beantwortet, abgegeben, offene Antworten bewertet und Ergebnis gespeichert.
- Wiederherstellung laufender Klausur nach Neuladen einschließlich Antworten geprüft.
- Abgelaufene Klausur nach Neuladen automatisch abgegeben.
- Glossarsuche mit Treffern und ohne Treffer geprüft.
- JSON-Export, Rückimport, Ablehnung einer ungültigen Datei sowie eigener Notenschlüssel geprüft.
- Mobile Navigation und Bildschirmbreiten 390, 768 und 1440 Pixel geprüft.
- Lernkapitel, Module und mobile Diagrammaufgabe auf horizontalen Überlauf geprüft.
- Desktop-, Handy-, Lernkapitel-, Flussmodul- und Diagrammansichten visuell gesichtet.

## Zusätzliche Prüfung der acht Erweiterungen

- Alte Lernstände ohne Zusatzfelder geladen: Antworten und Lesezeichen bleiben erhalten.
- Lernpläne mit verschiedenen Minutenbudgets, konkurrierenden Prioritäten, ungültigen Daten und Zeitumstellung geprüft.
- Tagesplan erstellt, Einheit abgehakt und nach Neuladen erhalten.
- Kapitelnotiz und Textauswahlmarkierung gespeichert; nach Neuladen und im Suchheft wiedergefunden.
- Notiz mit HTML-Zeichen als Text gerendert, ohne HTML auszuführen.
- Sechs Operatoren und zwölf Aufgaben einschließlich Teilbewertung geprüft.
- Kriterien-Checkliste in Übung und Klausurauswertung berechnet Teilpunkte korrekt.
- Sandbox prüft einzelne und gegenläufige Wirkungen.
- Domino prüft Rückgang und Zunahme einer Nahrungsquelle.
- Nischen-Arena prüft Vergleichsfläche, Konkurrentenentfernung und Auswertung beider Zustände.
- Alle zwölf Fehler der vier Schaubilder repariert und nach Neuladen wiedergefunden.
- Vollständiger Export, Zurücksetzen und Import übernimmt alle neuen Felder zusammen mit den bisherigen Lernständen.
- Alle neuen Ansichten bei 390, 768 und 1440 Pixeln auf horizontalen Überlauf geprüft.
- Desktop- und Mobilansichten visuell geprüft; künftige Tagespläne für kompakte Navigation einklappbar.

## Fachliche Prüfung

Die komplette Mappe wurde visuell geprüft. Die Einordnung findet sich in `QUELLEN.md`. Die richtige Pfeilrichtung, Sauerstoffverlauf entlang des Flusses, Stoff-/Energie-Unterscheidung, Regelgrenzen und Begriffskonventionen wurden gezielt berücksichtigt. Die Auswahlantworten wurden zusätzlich auf plausible fachliche Ablenkantworten überarbeitet.

Dies ist eine technische und inhaltliche Projektprüfung. Offene Schülerantworten bleiben eine Selbstbewertung anhand der angezeigten Kriterien; sie werden nicht durch eine automatisierte Sprachbewertung ersetzt. Der konkrete schulische Notenschlüssel und das tatsächlich benutzte Ecosphere-Gefäß sind nicht bekannt.

## GitHub-Veröffentlichung

Die PDF ist auf Wunsch nicht enthalten. Die direkten PDF-Links wurden entfernt; Quellen- und Seitenangaben bleiben zur Orientierung erhalten.

## Version 1.2 · gezielte Lernverbesserungen, 20.10.2026

- 23 Node-Tests: bestehende Daten und Antworten, Tagesauswahl über Themen mit Fehlern/verzögerten Wiederholungen/Transfer, 24-Stunden-Abstand, Fehler-Reset, JSON-Kompatibilität und Prüfung gespeicherter Trainings.
- Browser-Regressionsprüfung aller acht Aufgabenformen, sieben Basismodule, Klausurablauf und Wiederherstellung, Karteikarten, Suche, Import/Export sowie aller acht zuvor ergänzten Funktionen bestanden.
- Zusätzliche Browserprüfung: Tagestraining, Ersatz abbrechen/bestätigen, Entwürfe nach Neuladen, gespeicherte Reihenfolge, unbewertete Kriterienhäkchen, bewertete Antworten ohne doppelte Verbuchung und sauberes Trainingsende.
- Suche in eigenen Notizen und Aufgaben mit direktem Aufgabenstart geprüft. Begriffsebenen im Kapitel vorhanden.
- Nahrungsnetz bei 350, 390, 768 und 1440 Pixeln: keine Knotenüberlappungen oder abgeschnittenen Knoten, mindestens 44 Pixel hohe Ziele, alle fünf Verbindungen korrekt prüfbar, Pfeilkoordinaten nach Größenänderung gültig.
- Übersicht, Übungen, Systemebenen, Suche, Operatoren, Fehlerjagd, Nischen-Arena und Einstellungen ohne horizontalen Überlauf bei diesen Breiten. Mobilmenü schließt per Escape und Schaltfläche, gibt den Inhalt wieder frei und stellt den Fokus zurück.

Die neuen Statuswerte sind Lernhilfen; sie sind keine Vorhersage einer Klausurnote. Es wurden keine zusätzlichen biologischen Inhalte oder Messwerte erfunden.
