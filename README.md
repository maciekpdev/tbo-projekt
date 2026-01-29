
ZAD 1

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
