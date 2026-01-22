---
title: "Technischer Hintergrund"
heroImage: tafel.png
showToc: true
---

## Datenquelle

Die Auslastungsdaten stammen von der offiziellen [SWM-Webseite / Baederauslastung](https://www.swm.de/baeder/auslastung). Diese werden regelmäßig abgerufen und in einer Datenbank gespeichert.

### Aktualisierungsintervall

Die Daten werden alle 15 Minuten aktualisiert. Die historischen Daten reichen bis zum Projektstart zurück.

## Architektur

### Scraper

Die Daten werden von der SWM-Seite bzw. dem dahinterliegenden REST-Service ausgelesen.

Github Repository: [tillg/swm_pool_scraper](https://github.com/tillg/swm_pool_scraper)

### Daten

Die Daten liegen in einem Github Repository. Dort liegt auch die Logik, die die JSON-Dateien von einzelnen Scrapes zu einer konsolidierten CSV Datei zusammenführt. Diese CSV-Datei wird angezogen um die Grafik auszuspielen.

Github Repository: [tillg/swm_pool_data](https://github.com/tillg/swm_pool_data)


### Frontend

Das Frontend ist eine React-Anwendung mit TypeScript. Für die Diagramme wird D3.js verwendet.

Github Repository: [tillg/swm_pool_viewer](https://github.com/tillg/swm_pool_viewer)

## Technologie-Stack

- **React 18** - UI Framework
- **TypeScript** - Typsichere Entwicklung
- **D3.js** - Datenvisualisierung
- **styled-components** - CSS-in-JS Styling

## Open Source

Der Quellcode ist auf GitHub verfügbar. Beiträge sind willkommen!
