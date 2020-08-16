# Telescope Monitoring (Angular 8)

<img align="right" src="/.doc/balonMonitoring.png" width="500">
Táto webová aplikácia slúži na zobrazovanie číselnej a obrázkovej telemetrie v reálnom čase.
Aplikáciu vytváram na žiadosť môjho bratranca ktorý pracuje na projekte spoločnosti NASA.
Projektom je teleskop, ktorý bude uskutočňovať merania a pozorovania na okraji zemskej atmosféry ( [viac informácií o NASA projekte](https://data.nasa.gov/dataset/THAI-SPICE-Testbed-for-High-Acuity-Imaging-Stable-/id3c-sf6a) ).<br>

V tomto projekte má moja aplikácia prevziať hlavnú úlohu pri zobrazovaní telemetrie a vzdialenom nastavovaní zariadenia.

Aplikácia je v momentálne stave už použiteľná a jej základné funkcie sú k dispozícii:
* zobrazovanie číselnej telemetrie v interaktívnom grafe alebo v tabuľke
* zobrazovanie obrázkovej telemetrie
* nastaviteľný časový rozsah zobrazených dát a ľubovoľný náhľad do histórie
* zasielanie príkazov na meracie zariadenie

Aplikácia je flexibilná a nastaviteľná podľa vkusu užívateľa. Všetky okná je preto možné ľubovoľne presúvať a meniť ich veľkosť. 
Je možné vytvoriť viacero okien, ktoré zobrazia jeden alebo viacero zdrojov telemetrie. Posledné nastavenia užívateľa sú uložené 
vo webovom prehliadači, a preto je možné aplikáciu vypnúť bez straty nastavenia.

## Použité technológie
* Angular 8, RxJS, Typescript, Node.js, SCSS
* interaktívne grafy sú vytvorené opensource balíkom [Dygraphs](http://dygraphs.com/)

## Možnosť vyskúšať

Aplikácia je pre účely prezentácie k dispozícii na vyskúšanie, na adrese: https://87.197.183.237:5444 <br>
Pri prvom načítaní stránky sa môže zobraziť bezpečnostné upozornenie, to je treba odsúhlasiť (potvrdiť výnimku na certifikát). <br>
Dáta zobrazované v tejto verejnej verzii sú generované umelo na serveri, a teda neide o reálne merania. <br>
Dáta sú ale ďalej spracované štandardne, to znamená uložené do databázy, odkiaľ sú poskytované užívateľovi 
podľa ním zadaných časových intervalov v aplikácii. <br>

**Prístupové údaje do aplikácie:**<br>
```
visitor
1:OgaI82LKvjsd82/sk2F
```

**Stručný návod:**<br>
<img align="center" src="/.doc/navod.png" width="600">
