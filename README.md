# Telescope Monitoring

*(Popis v slovenčine nájdete nižšie)*<br>

<img align="right" src="/.doc/telescopeMonitoring2.png" width="500"></img>
Web application providing a user-friendly interface to monitor various kind of telemetry data produced by a remote device.<br>
I made this application on demand, as a monitoring platform for a device in this project: <br>
**web:** https://techport.nasa.gov/view/94313 <br>
**contact person:** Viliam Klein, viliam.klein@gmail.com, +1 303-827-6422

## Video presentation<br>
Full presentation of this application is available as a video: [youtube presentation (13min)](https://youtu.be/4Kk7DvttR24)

## Publicly available for testing<br>
Application is available online for anybody who would like to try it out. If you are interested, please visit this page: <https://87.197.183.237:5444>. <br>
Your browser might alert you about untrusted connection certificate, please confirm an exception for this certificate to proceed. <br>
To start the application, please log in using the following credentials:<br>
```
visitor
1:OgaI82LKvjsd82/sk2F
```
## Tools used
* Angular 8, Node.js, MySQL
* maps were created using [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org)
* graphs were created using [Dygraphs](http://dygraphs.com/)

## This code repository
Full source code of this project can be found in this repository.<br>
* [app-developement](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/app-developement) - Typescript source code of Angular web application before compilation
* [server-public](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/server-public/app) - public Node.js web server, as well as data server providing communication between client and remote device

<br>

*(Here ends english part of this presentation)*

---
*Prezentácia v slovenčine:*
<br>
<br>

Webová aplikácia, ktorá slúži na zobrazovanie telemetrie vzdialeného zariadenia v reálnom čase.

## Video prezentácia<br>
Ak máte záujem o video prezentáciu tejto aplikácie, nájdete ju na tejto adrese, avšak iba v anglickom jazyku: [youtube prezentácia (13min)](https://youtu.be/4Kk7DvttR24)

**Jej základné funkcie sú:**
* zobrazovanie číselnej telemetrie v grafe a v tabuľke
* zobrazovanie obrázkovej telemetrie
* zobrazovanie pozície v mape
* zasielanie príkazov na meracie zariadenie
* ľubovoľne nastaviteľný časový rozsah zobrazenia a náhľad do histórie meraní

Aplikácia je nastaviteľná podľa potrieb užívateľa. Všetky okná je možné ľubovoľne presúvať a meniť ich veľkosť. 
Je možné vytvoriť viacero okien, ktoré zobrazia jeden alebo viac zdrojov telemetrie. Posledné nastavenia užívateľa sú uložené 
vo webovom prehliadači, a preto je možné aplikáciu vypnúť bez straty nastavenia.

## Motivácia

Aplikáciu som vytvoril na žiadosť môjho známeho, ktorý pracuje na projekte spoločnosti NASA.
Projektom je teleskop, ktorý bude uskutočňovať merania a pozorovania na okraji zemskej atmosféry. <br>
Moja aplikácia je uceleným riešením pozorovania všetkých druhov dát, ktoré toto zariadenie produkuje. <br>
Projekt sa, žiaľ, oneskoruje kvôli pandemickej kríze. Preto táto aplikácia ešte nebola použitá v reálnych podmienkach.

<ins>**Viac o NASA projekte:**</ins><br>
**web:** https://techport.nasa.gov/view/94313 <br>
**kontaktná osoba:** Viliam Klein, viliam.klein@gmail.com, +1 303-827-6422

## Aplikáciu je možné vyskúšať

Aplikácia je pre účely prezentácie k dispozícii na vyskúšanie na adrese: <https://87.197.183.237:5444> <br>
Pri prvom načítaní stránky sa môže zobraziť bezpečnostné upozornenie, to je treba odsúhlasiť (potvrdiť výnimku na certifikát). <br>
Dáta zobrazované v tejto verejnej verzii sú generované umelo na serveri, a teda neide o reálne merania. <br>
Dáta sú ale ďalej spracované štandardne, to znamená, uložené do databázy, odkiaľ sú poskytované užívateľovi 
podľa ním zadaných časových intervalov v aplikácii. <br>

**Prístupové údaje do aplikácie:**<br>
```
visitor
1:OgaI82LKvjsd82/sk2F
```

**Stručný návod:**<br>
<img align="center" src="/.doc/navod.png" width="600"></img>



## Použité technológie
* Angular 8, Node.js, MySQL
* mapy sú vytvorené pomocou balíkov [Leaflet](https://leafletjs.com/) a [OpenStreetMap](https://www.openstreetmap.org)
* grafy sú vytvorené pomocou balíka [Dygraphs](http://dygraphs.com/)

## Github Repository
V tomto repozitári nájdete kód celého projektu:
* [app-developement](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/app-developement) - kód aplikácie pred kompiláciou
* [server-public](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/server-public/app) - kód veréjneho servera, ktorý slúži ako webový server (poskytuje samotnú aplikáciu), a zároveň ako dátový server (zasiela telemetrické dáta užívateľom)

