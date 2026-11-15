const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

async function request(path, { method = 'GET', body, csrfToken } = {}) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new Error('Cannot connect to EarthPulse API. Check the backend server.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg || 'Invalid input').join('. ')
        : response.status === 401
          ? 'Your session has expired. Sign in again.'
          : `Request failed with HTTP ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const mixesService = {
  list() {
    return request('/api/user/mixes');
  },

  get(mixId) {
    return request(`/api/user/mixes/${encodeURIComponent(mixId)}`);
  },

  create(payload, csrfToken) {
    return request('/api/user/mixes', {
      method: 'POST',
      body: payload,
      csrfToken
    });
  },

  update(mixId, payload, csrfToken) {
    return request(`/api/user/mixes/${encodeURIComponent(mixId)}`, {
      method: 'PUT',
      body: payload,
      csrfToken
    });
  },

  remove(mixId, csrfToken) {
    return request(`/api/user/mixes/${encodeURIComponent(mixId)}`, {
      method: 'DELETE',
      csrfToken
    });
  }
};
