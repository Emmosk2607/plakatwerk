# PLAKATWERK – Münster

Responsiver Webseiten-Prototyp für Plakatbestellungen, Druckvermittlung und Verteilung in Münster.

## Start
index.html im Browser öffnen oder den Repository-Ordner über einen lokalen Webserver bereitstellen. GitHub Pages: Branch main, Ordner / (root).

## Funktionen
- Eventmotive und Plakat-Konfigurator mit Demo-Preisen
- Verpflichtende Druckdatei als PDF/JPG/TIF bis 1.000 MB
- Registrierung und Login als lokales Demo-Konto
- Persönliche Aufträge, Fotoanfragen und Kunden-Dashboard
- Interaktive Münster-Karte mit ausdrücklich gekennzeichneter Demo-Kampagne

## Stand des Prototyps
Keine echten Bestellungen, Zahlungen, E-Mails oder automatische Druckanbieter-Vergleiche. Konten und Aufträge liegen in localStorage, die Sitzung in sessionStorage, Druckdateien in IndexedDB. Es gibt keine serverseitige Authentifizierung oder Zugriffskontrolle. Geräte und Browser teilen keine Daten. Für den späteren Kundenbetrieb sind Backend, Authentifizierung, Dateiablage und Auftragsverarbeitung erforderlich.

Die fünf generierten Eventmotive zeigen fiktive Veranstaltungen. Das Weekender-Herobild wurde vom Auftraggeber bereitgestellt. Die interaktive Karte verwendet Leaflet und OpenStreetMap.
