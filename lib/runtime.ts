type Environment = Record<string, string | undefined>;

// Public demo is an explicit opt-in: it exposes every fictional role, including admin.
export function isDemoEnabled(env: Environment = process.env) {
  if (env.DEMO_MODE === 'false') return false;
  return env.NODE_ENV !== 'production' ||
    (env.DEMO_MODE === 'true' && env.HUNTMATE_PUBLIC_DEMO === 'true');
}

export function requestOrigin(headers: Headers, url: string, env: Environment = process.env) {
  const fallback = new URL(url);
  // Render terminates TLS before forwarding requests to the Node process.
  if (env.RENDER === 'true' && env.RENDER_EXTERNAL_URL) {
    return new URL(env.RENDER_EXTERNAL_URL).origin;
  }
  const forwarded = env.RENDER === 'true' ? headers.get('x-forwarded-proto') : null;
  const protocol = forwarded === 'https' ? 'https:' : fallback.protocol;
  return `${protocol}//${headers.get('host') || fallback.host}`;
}

export function isSameOrigin(origin: string, expected: string) {
  try { return new URL(origin).origin === expected; } catch { return false; }
}
