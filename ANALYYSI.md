1. Mitä tekoäly teki hyvin?
Mielestäni se sai aikaan oikein toimivan, sekä vaatimukset täyttävän APIn, joka minun lisätyllä pyynnöllä oli myös aika hyvin jaettu osiin. Tärkein sekä yllättävin oli se että se sai heti aikaan koodia joka onnistui kaikissa vaatimuksissa. Myös myöhemmät testit jotka se kirjoitti toimivat hienosti, ja se ymmärsi hyvin minun koodin toiminnan, vaikka en antanut kuvaa minun kansioista. Olin myös positiivisesti yllättynyt että se heti antoi testin APIa varten.

2. Mitä tekoäly teki huonosti?
Se ei tehnyt minkäänkaltaisia oletuksia järjestelmästä joten sen tekemä API toimi siten, että kuka tahansa pystyi poistamaan varauksen. Se myös käytti heikkoa tapaa lukea päivämääriä. Kommentit olisivat myös voineet olla kattavampia mutta en itsekkään niihin laittanut paljoa aikaa tässä tehtävässä.

3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?
Tärkein oli minulle se, että API sai luontevan, ja minulle tutun, kansio asettelun joten tein sen ensimmäisenä. Toiminnallisesti tärkein oli se että kuka tahansa ei pystyisi poistamaan varauksia, sillä silloin jos huone olisi varattuna, sen voisi poistaa ja vaihtaa omaan. Järjestelmä jonka siihen laadin toimii pelkällä käyttätunnuksella, joka ei ole maailman turvallisin tapa, mutta näin JWT/token ratkaisun turhana tähän tehtävään. Oikeasti käyttöön menevään se kannattaisi kyllä lisätä. 
Rate limiting oli taas turvallisuudelta tärkeämpi lisäys, mutta ehkä myöskin vähän turha, joka rajoittaa määrää pyyntöjä joita käyttäjä voi APIlle lähettää. Vaikka hieman tähän turha niin päätin lisätä sen, koska se on suht helppo tehdä.

4. Oletuksia joita tein:
- Oletin että järjestelmää käytetään pienemmän yhtiön sisällä jossa ei luultavasti tule käyttäjätunnus konflikteja
- Oletin että käyttäjä ei halua että kuka tahansa voi poistaa hänen varausta
- Oletin että asiakas haluaisi admin roolin jolla voi poistaa varauksia esim. jos joku on yrittänyt varata huoneen vuodeksi. 
- Oletin että käyttäjä ei haluaisi että heidän käyttäjätunnus näkyisi kaikille muille (jolla silloin voisi poistaa varaus)