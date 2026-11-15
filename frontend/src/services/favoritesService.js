
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

async function request(path, options = {}) {
  const {
    method = 'GET',
    csrfToken,
    body
  } = options;

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
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers,
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
    let message = `Request failed with HTTP ${response.status}.`;

    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item.msg || 'Invalid input')
        .join('. ');
    } else if (response.status === 401) {
      message = 'Your session has expired. Please sign in again.';
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  return data;
}

export const favoritesService = {
  async list() {
    return request('/api/user/favorites');
  },

  async add(stationId, csrfToken) {
    return request('/api/user/favorites', {
      method: 'POST',
      csrfToken,
      body: {
        station_id: stationId
      }
    });
  },

  async remove(stationId, csrfToken) {
    return request(
      `/api/user/favorites/${encodeURIComponent(stationId)}`,
      {
        method: 'DELETE',
        csrfToken
      }
    );
  }
};
