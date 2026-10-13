# Weryfikacja HuntMate — 13 października 2026

- Vitest: **20/20** testów przeszło.
- Playwright / Microsoft Edge: **5/5** scenariuszy przeszło.
- TypeScript: kontrola zakończona poprawnie; końcowy `next build` również sprawdził typy.
- Next.js 16.4.0: produkcyjna kompilacja zakończona poprawnie.

## Sprawdzone zachowania

1. Komplet początkowych danych: 17 kont, 8 aktywnych wykonawców, 2 kandydatów, 12 ogłoszeń, 42 rezerwacje, 24 opinie i 8 rozmów.
2. Klient Kuba tworzy dwie sesje z Magnumem. Magnum je akceptuje, klient widzi zmianę statusu, a kalendarz pokazuje zajęte godziny.
3. Wspólny kalendarz blokuje kolidujące sesje różnych profesji i postaci. Równoczesne próby potwierdzenia kończą się jednym sukcesem i jednym konfliktem HTTP 409.
4. Własna postać jest dopasowywana względem serwera, profesji i poziomu. Wariant postaci klienta nie ogranicza się do własnego serwera wykonawcy.
5. Odrzucenie i wygaśnięcie rezerwacji, niedostępność jednego dnia, terminy przeszłe, nakładające się sesje oraz ochrona istniejących potwierdzeń przy edycji dostępności.
6. Wybór wykonawcy z ogłoszenia bez tworzenia duplikatów. Potwierdzenie oznacza ogłoszenie jako obsadzone.
7. Wiadomość wysłana przez klienta jest odczytywana w interfejsie wykonawcy. Użytkownik spoza rozmowy otrzymuje HTTP 403 przy próbie zapisu i nie widzi rozmowy w swojej liście.
8. Administrator akceptuje Novę, po czym profil staje się publiczny. Kontrola uprawnień, ukrywanie profili i ograniczenie opinii do jednej po terminie potwierdzonej rezerwacji.
9. Haszowanie haseł i tokenów sesji, nieujawnianie e-maili w publicznych profilach oraz odrzucanie żądań z obcego źródła.
10. Po zamknięciu i ponownym otwarciu pliku bazy rezerwacja i wiadomość pozostają zapisane; dane nie są ponownie duplikowane.
11. Zmiana czasu w Polsce: sesja 01:00–04:00 w dzień zmiany trwa odpowiednio 4 albo 2 rzeczywiste godziny.

## Obraz i układ

Strona główna została sprawdzona przy szerokościach 1440, 1024 i 390 px. Wszystkie obrazy się wczytały, nie wystąpiło przewijanie poziome strony ani błędy wykonywania JavaScript.

Katalog, profil klienta z formularzem, panel, tworzenie ogłoszenia i czat sprawdzono przy szerokościach 1024 i 390 px. Kalendarz na małym ekranie przewija się we własnym obszarze, bez poszerzania strony.

Zrzuty w `screenshots`:

- `home-1440.png`, `home-1024.png`, `home-390.png`;
- `profile-magnum.png`, `calendar-booking.png`;
- `client-panel.png`, `admin.png`;
- `search-mobile.png`, `profile-client-mobile.png`, `panel-mobile.png`;
- `new-listing-mobile.png`, `chat-mobile.png`.

Testy przeglądarkowe używają oddzielnej bazy `data/e2e.sqlite`. Zestaw danych głównego demo pozostaje dostępny do samodzielnego sprawdzenia.

## Ograniczenia wersji lokalnej

Brak płatności i wysyłania maili. Konta i opinie są fikcyjne. To niezależny prototyp; zakres praw do komercyjnego użycia ilustracji i warunki publicznego uruchomienia pozostają do potwierdzenia. Źródła grafik: ASSET-SOURCES.md. Zasady uruchamiania i resetu: README.md.
