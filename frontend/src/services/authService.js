
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

function getErrorMessage(data, status) {
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg || 'Invalid input')
      .join('. ');
  }

  if (status === 401) {
    return 'Invalid credentials or expired session.';
  }

  if (status === 409) {
    return 'This email address is already registered.';
  }

  return `Request failed with HTTP ${status}.`;
}

async function apiRequest(
  path,
  { method = 'GET', body, csrfToken } = {}
) {
  const headers = {
    Accept: 'application/json'
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  let response;

  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      credentials: 'include',
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {})
    });
  } catch {
    throw new Error(
      'Cannot connect to EarthPulse API. Check that the backend is running.'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(data, response.status)
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export const authService = {
  register(email, password) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: { email, password }
    });
  },

  login(email, password) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  me() {
    return apiRequest('/api/auth/me');
  },

  logout(csrfToken) {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
      csrfToken
    });
  }
};
