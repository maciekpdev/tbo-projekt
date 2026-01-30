
ZAD 1

Stworzone przez na CI/CD korzysta z skanerów SCA: python: pip-audit, SAST: python: bandit, DAST: OWASP ZAP. 

Flow CI/CD przebiega w podany sposób:

1. Uruchamiane zostają równolegle bandit scan, pip audit oraz unit testy.
2. Jeśli wszystkie z poprzednich jobów powiodą się tworzony jest docker image aplikacji, który wgrywany jest do GitHub Container Registry. Wersja z gałęzi main jest otagowana jako latest. Z innych jako beta.
3. Wykonywany jest ostatni job OWASP ZAP.

Joby generują raporty, które są dostępne do pobrania.
W ramach projektu i weryfikacji obu zadań, joby pip audit oraz bandit przechodzą mimo wykrycia podatności.

-----SCA------

W celu analizy używanych bibliotek i pakietów pod kątem bezpieczeństwa i zgodności licencyjnej użyto skanera pip-audit. Wykrył on podatności w 11 bibliotekach. 
Przykładowo fragment raportu:

    {"dependencies": [{"name": "alembic", "version": "1.12.0", "vulns": []}, {"name": "blinker", "version": "1.6.2", "vulns": []}, {"name": "click", "version": "8.1.7", "vulns": []}, {"name": "colorama", "version": "0.4.6", "vulns": []}, {"name": "flask", "version": "2.3.3", "vulns": []}, {"name": "flask-migrate", "version": "4.0.5", "vulns": []}, {"name": "flask-sqlalchemy", "version": "3.1.1", "vulns": []}, {"name": "flask-wtf", "version": "1.2.1", "vulns": []}, {"name": "greenlet", "version": "2.0.2", "vulns": []}, {"name": "itsdangerous", "version": "2.1.2", "vulns": []}, {"name": "jinja2", "version": "3.1.2", "vulns": [{"id": "CVE-2024-22195", "fix_versions": ["3.1.3"], "aliases": ["GHSA-h5c8-rqwp-cp95"], "description": "The `xmlattr` filter in affected versions of Jinja accepts keys containing spaces. XML/HTML attributes cannot contain spaces, as each would then be interpreted as a separate attribute. If an application accepts keys (as opposed to only values) as user input, and renders these in pages that other users see as well, an attacker could use this to inject other attributes and perform XSS. Note that accepting keys as user input is not common or a particularly intended use case of the `xmlattr` filter, and an application doing so should already be verifying what keys are provided regardless of this fix."}, {"id": "CVE-2024-34064", "fix_versions": ["3.1.4"], "aliases": ["GHSA-h75v-3vvj-5mfj"], "description": "The `xmlattr` filter in affected versions of Jinja accepts keys containing non-attribute characters. XML/HTML attributes cannot contain spaces, `/`, `>`, or `=`, as each would then be interpreted as starting a separate attribute. If an application accepts keys (as opposed to only values) as user input, and renders these in pages that other users see as well, an attacker could use this to inject other attributes and perform XSS. The fix for the previous GHSA-h5c8-rqwp-cp95 CVE-2024-22195 only addressed spaces but not other characters.  Accepting keys as user input is now explicitly considered an unintended use case of the `xmlattr` filter, and code that does so without otherwise validating the input should be flagged as insecure, regardless of Jinja version. Accepting _values_ as user input continues to be safe."}, {"id": "CVE-2024-56326", "fix_versions": ["3.1.5"], "aliases": ["GHSA-q2x7-8rv6-6q7h"], "description": "An oversight in how the Jinja sandboxed environment detects calls to `str.format` allows an attacker that controls the content of a template to execute arbitrary Python code.  To exploit the vulnerability, an attacker needs to control the content of a template. Whether that is the case depends on the type of application using Jinja. This vulnerability impacts users of applications which execute untrusted templates.  Jinja's sandbox does catch calls to `str.format` and ensures they don't escape the sandbox. However, it's possible to store a reference to a malicious string's `format` method, then pass that to a filter that calls it. No such filters are built-in to Jinja, but could be present through custom filters in an application. After the fix, such indirect calls are also handled by the sandbox."}

------SAST------

W celu analizy kodu źródłowego Pythona pod kątem potencjalnych podatności bezpieczeństwa użyto skanera Bandit. Bandit działa statycznie, czyli nie uruchamia aplikacji, lecz przegląda kod, identyfikując fragmenty, które mogą być ryzykowne.

Skaner ten wykrył 3 podatności. Zdiagnozował 2 jako severity 'LOW' i jeden 'MEDIUM'.

Podatności Low:
    
    1. Possible hardcoded password: 'supersecret'
    2. Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. (Zostało to zdiagnozowane w 3 miejsach w kodzie w unit teście)

Podatność Medium:

    2. Potential XSS with ``flask.Markup`` detected. Do not use ``Markup`` on untrusted data.


------DAST--------

W celu zweryfikowania odporności aplikacji oraz skuteczności potoku CICD, wdrożono skaner dynamiczny OWASP ZAP w trybie Full Scan (Active Scan).
1. Cel testu

Udowodnienie, że mechanizmy bezpieczeństwa w procesie CICD potrafią wykryć podatność typu Path Traversal w działającej instancji aplikacji (uruchomionej w kontenerze Docker), zanim zostanie ona dopuszczona do rejestru obrazów.

2. Wykorzystany Exploit (Path Traversal)

W gałęzi testowej wprowadzono podatny kod w module książek, który pozwala na odczyt dowolnego pliku z serwera poprzez parametr URL:

    Adres testowy: http://localhost:5000/books/?file=../../project/__init__.py

    Mechanizm: Brak walidacji wejścia pozwala na użycie sekwencji ../, co umożliwia wyjście poza katalog static i odczytanie plików konfiguracyjnych aplikacji.

3. Wynik skanowania ZAP

Podczas wykonywania kroku dast-scan, narzędzie OWASP ZAP przeprowadziło aktywny atak (fuzzing) na parametr file.

Kluczowe znalezisko w raporcie:

    Alert: Path Traversal

    Ryzyko (Risk Level): High / Medium (w zależności od konfiguracji)

    Dowód (Evidence): Skaner pomyślnie wstrzyknął ładunek %2Fetc%2Fpasswd oraz ścieżki względne, otrzymując w odpowiedzi (HTTP 200 OK) zawartość plików, które nie powinny być publicznie dostępne.

4. Reakcja procesu CICD (Blokada wdrożenia)

Zgodnie z zaprojektowanym procesem, wykrycie podatności przez ZAP skutkowało natychmiastowym przerwaniem potoku:

    Status Joba: Failed

    Kod wyjścia: Exit Code 2

    Skutek: Obraz aplikacji z tagiem :beta nie został uznany za bezpieczny, a wdrożenie zostało zablokowane.

    Wniosek: Testy DAST poprawnie zidentyfikowały lukę bezpieczeństwa w działającym środowisku, co w połączeniu z testami SAST (Bandit) zapewnia pełną kontrolę nad bezpieczeństwem kodu w procesie CICD.

To run app

```shell
docker build -t task1-python .
docker run -p 5000:5000 task1-python
```

# 📚 Book Library App 📚

- Python Flask full stack book library application with full modularity.
- Each entity has its own files seperated (forms.py, models.py, views.py, HTML, CSS, JavaScript).
- Database will be generated and updated automatically.

## 🚀 Features 🚀

- **Dashboard:**
  - Read, add, edit, and delete books.
  - Read, add, edit, and delete customers.
  - Read, add and delete loans.

- **Search Functionality:**
  - Easily search for books by name.
  - Easily search for customers by name.
  - Easily search for loans by name.

- **Responsive Design:**
  - Provides a seamless user experience across various devices.

## 🛠️ Technologies Used 🛠️

- **Frontend:**
  - HTML
  - CSS
  - Bootstrap
  - JavaScript
  - Axios

- **Backend:**
  - Python
  - Flask
  - JSON

- **Database:**
  - SQL
  - SQLAlchemy

## 🔧 Installation 🔧

1. Clone the repository:
   git clone (https://github.com/MohammadSatel/Flask_Book_Library.git)

2. Create a virtual enviroment:
   py -m venv (virtual enviroment name)
3. Activate the virtual enviroment:
   (virtual enviroment name)\Scripts\activate

4. Install needed packages:
   pip install -r requirements.txt

5. run the main app:
   py app.py (your path/Flask_Book_Library/app.py)

6. Connect to the server:
   Running on (http://127.0.0.1:5000)

7. Enjoy the full stack book library app with CRUD and DB.
