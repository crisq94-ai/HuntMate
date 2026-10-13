# HuntMate — pokaz znajomym na Render Free

Repozytorium aplikacji: https://github.com/crisq94-ai/HuntMate

Jedna usługa Web Service, runtime Node, region Frankfurt, plan **Free**. Nie tworzymy płatnego dysku ani zewnętrznej bazy.

| Ustawienie | Wartość |
|---|---|
| Branch | main |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run start:render` |
| Node | 22.18.0 (plik `.node-version`) |
| DEMO_MODE | true |
| HUNTMATE_PUBLIC_DEMO | true |
| NEXT_TELEMETRY_DISABLED | 1 |
| HUNTMATE_DB | data/huntmate.sqlite |

Render przekazuje `PORT`, `RENDER` i `RENDER_EXTERNAL_URL`. Start wiąże się z `0.0.0.0`, a sesje oraz kontrola źródła żądań uwzględniają HTTPS przed proxy Rendera. `/api/health` sprawdza działanie aplikacji i bazy. Baza inicjalizuje się automatycznie przy pierwszym żądaniu.

To publiczne demo: każdy odwiedzający może wybrać klienta, wykonawcę lub administratora. Nie wpisuj prawdziwych danych, haseł do gry ani prywatnych wiadomości. Wszystkie konta i opinie startowe są fikcyjne.

**Ograniczenia Free:** po 15 minutach bez ruchu aplikacja zasypia, a kolejne otwarcie może potrwać około minuty. Lokalna baza SQLite jest nietrwała na Render Free: uśpienie, restart lub ponowne wdrożenie usuwa zmiany i przywraca dane przykładowe. Lokalna wersja na komputerze nadal zachowuje własną bazę. Szczegóły: https://render.com/docs/free

Serwis automatycznie wdraża kolejne zmiany gałęzi main. Build korzysta z `package-lock.json`. Repozytorium nie zawiera baz, sesji, plików `.env`, zależności ani danych innych projektów.

Po wdrożeniu otwórz adres `onrender.com`, wybierz **Zmień użytkownika demo** i sprawdź scenariusz z README. Publiczną aplikację można zweryfikować poleceniem `node scripts/verify-deployment.mjs https://ADRES.onrender.com`; test wykonuje przykładową rezerwację i rozmowę.
