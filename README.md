
# Zadanie 2

## SSTI

Stworzony zestał dodatkowy ekran dla nieznalezionych książek. Wprowadzono podatność SSTI (Server-Side Template Injection) polegającą na bezpośrednim wstawieniu danych użytkownika (`book_name`) do template stringa, który jest następnie renderowany przez `render_template_string()`. W funkcji `get_book_details()` w pliku `project/books/views.py`.

**Przykładowe exploity:**


- `{{7*7}}` - wykonuje mnożenie, zwraca `49`
- `{{config.SECRET_KEY}}` - wyciąga klucz sekretny aplikacji
- `{{''.__class__.__mro__[1].__subclasses__()}}` - lista dostępnych klas

### Screeny podatności:

#### 1. Normalne użycie ekranu

![Normalne użycie](img/normalne.png)
_Normalne wyświetlenie strony błędu dla nieistniejącej książki_

#### 2. Wstrzyknięcie kodu

![Wstrzyknięcie mnożenia](img/mnozenie.png)
_Wstrzyknięcie mnożenia w parametrze URL powoduje wykonanie kodu Jinja2 i wyświetlenie wyniku zamiast tekstu_

#### 3. Wstrzyknięcie wydobycia klucza ({{config.SECRET_KEY}})

![Wstrzyknięcie klucza](img/supersecret.png)
_Wstrzyknięcie `{{config.SECRET_KEY}}` pozwala na wyciągnięcie wrażliwego klucza sekretnego aplikacji Flask_

## Path Traversal

Do ekranu wyświetlania listy książek dodano krótki opis strony, pobierany z katalogu `static`. W funkcji `list_books()` w pliku `project/books/views.py` wprowadzono podatność Path Traversal polegającą na możliwym uzyskaniu dostępu do dowolnego pliku z katalogu projektu przy wskazaniu odpowiedniego URL. Dodany kod nie weryfikuje nazwy czytanego pliku, co pozwala na wskazanie ścieżki spoza katalogu `static` i wyświetlenie wrażliwych skryptów aplikacji.

**Przykładowe exploity:**

- `?file=../../project/__init__.py` - wyświetla plik konfiguracyjny aplikacji Flask
- `?file=../../project/books/views.py` - wyświetla kod i logikę działania ekranu

### Screeny podatności:

#### 1. Normalne użycie ekranu

![Normalne użycie](img/normalne_2.png)
_Normalne wyświetlenie domyślnego, poprawnego opisu do ekranu listy książek_

#### 2. Manipulacja ścieżką pliku

![Manipulacja ścieżką pliku](img/init_code.png)
_Wymuszenie ścieżki pliku `?file=../../project/__init__.py` pozwala na wyświetlenie konfiguracji aplikacji Flask i pozyskanie wrażliwego klucza sekretnego_

---