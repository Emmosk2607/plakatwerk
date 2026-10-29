# PLAKATWERK – Version 2.1

## Änderungen gegenüber Version 2.0

### 1. Statische Plakatvorschau
- Das Motiv bleibt bei der Auswahl von DIN A0, A1, A2 und A3 gleich groß in der Vorschau.
- Papier und Veredelung verändern die Abbildungsgröße und das Vorschaubild nicht.
- Formatname, Breite und Höhe sowie Auflage, Papier und Veredelung werden weiterhin aktuell angezeigt.
- Die Vorschau passt sich nur an die verfügbare Bildschirmbreite an und zeigt das Motiv vollständig.

### 2. Neue Navigation für Handy und Desktop
- Einzeiliger mobiler Kopfbereich: Bildmarke und Wortmarke links, Konto, Warenkorb und Menü rechts.
- Konto und Warenkorb verwenden auf kleinen Displays kompakte Symbole mit zugänglichen Beschriftungen.
- Aufklappbares Menü mit klar getrennten Seitenlinks; der aktive Bereich wird markiert.
- „Meine Aufträge“ ist mobil im Menü erreichbar.
- Das Menü schließt beim Klick außerhalb, beim Aufruf eines Bereichs und per Escape-Taste.

### 3. Neue Bildmarke und einheitliche Symbole
- Das grüne Quadrat mit dem diagonalen Pfeil wurde durch eine eigene SVG-Bildmarke aus stilisierten Druckbögen ersetzt.
- Sichtbare Pfeilzeichen werden auf allen Seiten und in dynamischen Ansichten durch einheitliche, schlanke SVG-Symbole ersetzt.
- Auch Konfigurator, Kundenbereich, Warenkorb und Dialoge verwenden dieselbe Symbolsprache.
- Vorhandene Bilddateien und Eventplakate wurden nicht verändert.

### 4. Geordnetes Layout
- Einheitliche Abstände, Rundungen und Feldgrößen.
- Ruhigere Karten, klarere Seitenüberschriften und kompaktere Verweise auf der Startseite.
- Besser strukturierte Pakete, Leistungsübersicht und Plakatkollektion auf kleinen Displays.
- Getrennte Seiten für Start, Leistungen, Ablauf, Pakete, Plakatmotive und FAQ bleiben erhalten.

## Dateien und Einstieg
- dist/index.html: Startseite
- dist/leistungen.html, dist/ablauf.html, dist/pakete.html, dist/plakatmotive.html, dist/faq.html: Unterseiten
- dist/ui-refinement.js: einheitliche Symbole und Menü-Ergänzungen
- dist/format-preview.js: statische Vorschau mit aktuellen Formatangaben
- dist/style.css: Desktop- und Handygestaltung

Lokale Vorschau: Im Ordner Version 2.1 `node preview.cjs` ausführen. Der Port 4173 muss frei sein. Online: https://emmosk2607.github.io/plakatwerk/

## Versionsschutz
Diese Version wurde als unabhängiger Ordner von Version 2.0 abgeleitet. Version 1.0 und Version 2.0 bleiben unverändert. Weiterentwicklung ab jetzt ausschließlich in Version 2.1.

## Grenzen des Prototyps
Konten und Aufträge werden weiterhin lokal im Browser gespeichert. Druckdateien liegen lokal in IndexedDB. Es gibt noch keine serverseitige Authentifizierung, Synchronisierung zwischen Geräten, echte Bestellung oder Übertragung an Druckereien.
