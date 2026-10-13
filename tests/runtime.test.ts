import { describe, expect, it } from 'vitest';
import { isDemoEnabled, isSameOrigin, requestOrigin } from '../lib/runtime';

describe('Konfiguracja lokalna i Render', () => {
  it('włącza publiczny przełącznik tylko po świadomym ustawieniu obu flag', () => {
    expect(isDemoEnabled({ NODE_ENV: 'development' })).toBe(true);
    expect(isDemoEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(isDemoEnabled({ NODE_ENV: 'production', DEMO_MODE: 'true' })).toBe(false);
    expect(isDemoEnabled({ NODE_ENV: 'production', DEMO_MODE: 'true', HUNTMATE_PUBLIC_DEMO: 'true' })).toBe(true);
    expect(isDemoEnabled({ NODE_ENV: 'development', DEMO_MODE: 'false' })).toBe(false);
  });
  it('rozpoznaje HTTPS za proxy Rendera i odrzuca inne źródła', () => {
    const origin = requestOrigin(new Headers({ host: 'localhost:10000' }), 'http://localhost:10000/api/auth/demo',
      { RENDER: 'true', RENDER_EXTERNAL_URL: 'https://huntmate-test.onrender.com' });
    expect(origin).toBe('https://huntmate-test.onrender.com');
    expect(isSameOrigin(origin, origin)).toBe(true);
    expect(isSameOrigin('https://obca-strona.example', origin)).toBe(false);
    expect(isSameOrigin('http://huntmate-test.onrender.com', origin)).toBe(false);
    expect(isSameOrigin('null', origin)).toBe(false);
  });
  it('zachowuje lokalny adres 127.0.0.1 i nie ufa nagłówkom proxy poza Renderem', () => {
    const headers = new Headers({ host: '127.0.0.1:3000', 'x-forwarded-proto': 'https' });
    expect(requestOrigin(headers, 'http://localhost:3000/api/auth/demo', {})).toBe('http://127.0.0.1:3000');
  });
});
