# Quantisierungs-Visualisierer

[🇬🇧 English Version](https://github.com/Ahmed-Kaid/quantization-visualizer/blob/main/README.md)

Eine einfache interaktive Website, welche die Quantisierungsmethode visualisert, welche in der JPEG-Kompression verwendet wird.

## Anforderungen

- NodeJS (https://nodejs.org/)

- Einen modernen Web Browser
  (Chrome ≥ 60, Firefox ≥ 60, Edge ≥ 15.15063, iOS ≥ 10, Safari ≥ 10, Android ≥ 6)

## Herunterladen

Um das Projekt herunterzuladen, kann man einen der folgenden Möglichkeiten verwenden.

- Klone diese repo mit `git clone https://github.com/Ahmed-Kaid/quantization-visualizer.git`
- Lade den letzten Release herunter
- Lade die Repo als ZIP-Datei herunter und entpacke diese in einen Ordner.

## Nutzung

Nach dem herunterladen, führe `npm install` im Ursprungsverzeichnis aus, um alle Dependencies zu installieren.

Um die Seite zu öffnen, führt man `npm start` im Ursprungsordner aus.

**Notiz:** Es ist gewollt, dass die Quantisierungsmatrix bei der benutzerdefinierten Kompression nach einer Aktualisierung gleich bleibt. Um sie zurückzusetzen, kann man einen "Hard Reload" durchführen (meistens mit `STRG+F5`)

## Anerkennungen

Vielen Dank an:

- [Start Bootstrap](https://github.com/startbootstrap) für ihre Vorlage [SB Admin 2](https://github.com/startbootstrap/startbootstrap-sb-admin-2)

- [wanger](https://github.com/WangYuLue/) für die Bibliothek [image-conversion](https://github.com/WangYuLue/image-conversion)

- [bellbind](https://gist.github.com/bellbind) für [dieses gist](https://gist.github.com/bellbind/eb3419516e00fdfa13f472d82fd1b495)

- Artikel, welche JPEG-Kompression erklären

  - [cgjennings.ca](https://cgjennings.ca/articles/jpeg-compression/)
  - [tutorialspoint.com](https://www.tutorialspoint.com/dip/introduction_to_jpeg_compression.htm)
  - [robertstocker.co.uk](https://www.robertstocker.co.uk/jpeg/jpeg_new_1.htm)
  - [Wikipedia](https://en.wikipedia.org/wiki/JPEG#JPEG_compression)
  - [yasoob.me](https://yasoob.me/posts/understanding-and-writing-jpeg-decoder-in-python/#huffman-encoding)
