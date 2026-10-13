# HuntMate — lokalne demo

Polskojęzyczna platforma zastępstw do Tibii: profile, dostępność, rezerwacje, ogłoszenia, czat, opinie oraz administracja. Next.js 16 / React 19 / TypeScript / Tailwind 4 / SQLite.

## Start na Windows

W PowerShell:

```powershell
Set-Location 'C:\Users\macie\Documents\ChatGPT\ntsw\tibia-marketplace'
.\start-local.ps1
```

Skrypt instaluje brakujące zależności, inicjalizuje bazę i wybiera pierwszy wolny port od 3000. Nie zatrzymuje innych aplikacji. Adres zostanie wypisany w terminalu. Zatrzymanie: Ctrl+C.

Jeśli system blokuje uruchomienie skryptu, można wykonać bezpośrednio:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install --no-audit --no-fund
& 'C:\Program Files\nodejs\npm.cmd' run db:init
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

Wymagany Node.js 22.18 lub nowszy zgodny z Next.js 16. W tym środowisku zwykły skrót `npm` jest nieprawidłowy, dlatego instrukcje używają pełnej ścieżki. Ostrzeżenie Node o eksperymentalnym module SQLite jest oczekiwane na Node 22.

## Konta demonstracyjne

Najwygodniej kliknąć **Zmień użytkownika demo** w górnym pasku. Przycisk po zalogowaniu wyświetla aktualny pseudonim. Zmiana konta uruchamia prawdziwą sesję i otwiera panel tej osoby.

| Rola | Konto | E-mail |
|---|---|---|
| Klient | Kuba | kuba@demo.local |
| Klient | Ola | ola@demo.local |
| Wykonawca | Magnum | magnum@demo.local |
| Wykonawca | Runa | runa@demo.local |
| Kandydat | Nova | nova@demo.local |
| Administrator | Administracja | admin@demo.local |

Hasło wszystkich przygotowanych kont: `HuntMateDemo!2026`.

Przełącznik demo jest dostępny w trybie developerskim, chyba że `DEMO_MODE=false`. W produkcyjnym uruchomieniu wymaga jednocześnie `DEMO_MODE=true` i `HUNTMATE_PUBLIC_DEMO=true`. To świadomie otwiera wszystkie fikcyjne role, także administratora. Używaj wyłącznie przykładowych danych. Instrukcja pokazu na darmowym Renderze: [RENDER-DEPLOY.md](RENDER-DEPLOY.md).

## Co sprawdzić w pięć minut

1. Wybierz **Kuba**, otwórz profil **Magnum** i dodaj dwie przyszłe sesje w jego dostępności (standardowo 15:00–18:00 lub 19:00–22:00). Magnum obsługuje Monk i Paladin, poziomy 600–1800. Kliknij **Sprawdź podsumowanie**, następnie **Wyślij rezerwację**.
2. Zmień konto na **Magnum**, wejdź w **Rezerwacje**, znajdź zapytanie i kliknij **Potwierdź**. Termin blokuje się dla wszystkich jego ofert.
3. Kliknij **Rozmowa**, wyślij wiadomość, przełącz się z powrotem na Kubę i odczytaj ją w wiadomościach.
4. Jako Kuba otwórz **Moje ogłoszenia**. Jedno przygotowane ogłoszenie ma kandydata Magnuma. Wybór tworzy oczekującą rezerwację, którą wykonawca osobno akceptuje.
5. Wybierz **Administracja**, otwórz **Administracja** i zaakceptuj Novę. Jej profil pojawi się w publicznym katalogu. Jako Nova dodaj dostępność w panelu wykonawcy.
6. W **Rezerwacjach** klienta znajdź historyczną sesję bez opinii i dodaj ocenę. Profil oraz ranking zostaną zaktualizowane.

Własna postać Magnuma to **Magnum Main**, Monk, poziom 1200, Antica. Jego alternatywna postać to Paladin, poziom 1200, Secura. Wybierz właściwy zakres poziomów, aby zobaczyć je w formularzu.

## Dane i reset

Baza: `data/huntmate.sqlite`, poza katalogiem publicznym. Pierwsza inicjalizacja tworzy 17 kont, 8 aktywnych wykonawców, 2 kandydatów, 12 ogłoszeń, 42 rezerwacje, 24 opinie i 8 rozmów. Terminy są liczone od dnia pierwszego uruchomienia. Ponowne uruchomienie zachowuje zmiany.

Aby odświeżyć daty i wrócić do początkowego zestawu, najpierw zatrzymaj serwer, następnie:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run db:reset
```

**Reset usuwa dotychczasowe dane lokalnego demo, także ręcznie dodane konta i wiadomości.** Dopuszczony jest wyłącznie plik bazy wewnątrz katalogu `data` tego projektu. Po resecie uruchom serwer ponownie.

## Sprawdzenie jakości

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Testy Vitest tworzą osobne bazy w pamięci. Playwright korzysta z zainstalowanego Edge, osobnego serwera na porcie 3005, katalogu kompilacji `.next-test` i bazy `data/e2e.sqlite`. Przed testem odtwarza tylko tę bazę testową. Nie zmienia danych oglądanego demo. Port 3005 musi być wolny.

Zrzuty ekranu znajdują się w `screenshots`. W razie niepowodzenia testu przeglądarkowego ślad diagnostyczny trafia do `test-results`.

## Architektura i reguły

- `lib/db.ts`: schemat SQLite, inicjalizacja i dane demonstracyjne.
- `lib/services.ts`: autoryzacja, dopasowanie, rezerwacje, wiadomości, opinie i administracja.
- `lib/types.ts`: współdzielone typy i schematy Zod; `lib/time.ts`: strefa Europe/Warsaw oraz przedziały czasu.
- `app/api/[...path]/route.ts`: Route Handlers, sesje HttpOnly, odpowiedzi błędów i kontrola źródła żądań.
- `components`: interfejs publiczny i panele. Reguły dostępności oraz uprawnień są ponownie sprawdzane na serwerze.

Rezerwacje oczekujące nie zajmują terminu. Potwierdzenie całego zlecenia odbywa się w transakcji `BEGIN IMMEDIATE`, ze sprawdzeniem dostępności i kolizji. Jedna aktywna rezerwacja może być powiązana z danym ogłoszeniem. Czat i powiadomienia odświeżają się co pięć sekund w otwartych widokach.

Nie ma płatności, prowizji, automatycznej weryfikacji tożsamości, gwarancji ochrony konta, rozstrzygania sporów ani integracji z grą. Nie należy przekazywać przez aplikację danych logowania do Tibii. Publiczne uruchomienie wymaga osobnego przygotowania zasad i oceny modelu usługi względem warunków CipSoft.

## Grafiki

Wszystkie ilustracje są zapisane lokalnie. Lista źródeł i ograniczeń wykorzystania: **ASSET-SOURCES.md**. Oficjalne grafiki należą do CipSoft; nie pozyskiwano losowych prac fanowskich ani zdjęć osób. Warunki publikacji i użycia komercyjnego pozostają do potwierdzenia.
