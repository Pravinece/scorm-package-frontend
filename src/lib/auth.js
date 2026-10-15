const TOKEN_KEY = "token";
const USER_KEY = "sc_user";

/**
 * The backend issues a JWT on login. The API docs explicitly require
 * storing it in sessionStorage (not localStorage), so that's what this
 * file does — for both the token and the decoded user record, so a
 * browser-close naturally logs the user out.
 */
export function setSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getSessionUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
