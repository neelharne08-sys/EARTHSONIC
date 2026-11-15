import { STATIONS } from '../data/stations';

function generateEarthPulseFallback() {
  const count = 100;
  const brightness = [];
  const frequencies = [];

  for (let i = 0; i < count; i++) {
    const t = i / count;

    const b = +(
      0.5 +
      0.35 * Math.sin(t * Math.PI * 4) +
      0.12 * Math.cos(t * Math.PI * 8)
    ).toFixed(4);

    const normB = Math.max(0.05, Math.min(1.0, b));

    brightness.push(normB);

    const freq = +(180 + normB * 580).toFixed(2);
    frequencies.push(freq);
  }

  return {
    status: 'fallback',
    source: 'Simulated EarthPulse Demo Data',
    brightness,
    frequencies,
    min_freq: Math.min(...frequencies),
    max_freq: Math.max(...frequencies),
    sample_count: count
  };
}

export const dataService = {
  getStations() {
    return STATIONS;
  },

  getStationById(id) {
    return STATIONS.find(s => s.id === id) || STATIONS[0];
  },

  async checkBackendHealth(baseUrl = 'http://localhost:8000') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch(baseUrl + '/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        return {
          online: false,
          error: 'HTTP ' + res.status
        };
      }

      const data = await res.json();

      return {
        online: data.status === 'ok',
        data
      };
    } catch (err) {
      return {
        online: false,
        error: err.message
      };
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async fetchEarthPulseSonification(
    baseUrl = 'http://localhost:8000'
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(baseUrl + '/api/sonification', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }

      const json = await res.json();

      const brightness = json.data?.brightness;
      const frequencies = json.data?.frequencies;
      const samples = json.data?.samples;

      if (
        json.status !== 'success' ||
        !Array.isArray(brightness) ||
        !Array.isArray(frequencies) ||
        brightness.length !== 100 ||
        frequencies.length !== 100 ||
        samples !== 100 ||
        !brightness.every(
          value =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 1
        ) ||
        !frequencies.every(
          value =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 180 &&
            value <= 760
        )
      ) {
        throw new Error('Invalid EarthPulse API response');
      }

      return {
        status: 'live',
        source: json.source?.title || 'EarthPulse FastAPI',
        brightness,
        frequencies,
        min_freq:
          json.data.minimum_frequency ??
          Math.min(...frequencies),
        max_freq:
          json.data.maximum_frequency ??
          Math.max(...frequencies),
        sample_count: samples,
        raw: json
      };
    } catch (err) {
      console.warn(
        'EarthPulse backend unavailable or invalid:',
        err.message
      );

      return generateEarthPulseFallback();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async loadTimeline(stationId) {
    const earthPulse = generateEarthPulseFallback();

    return {
      station: stationId,
      duration: 45.0,
      timeStep: 0.45,
      earthPulseData: earthPulse,
      dataType: 'simulated',
      dataPoints: earthPulse.brightness.map((b, idx) => ({
        time: +(idx * 0.45).toFixed(2),
        brightness: b,
        frequency: earthPulse.frequencies[idx],
        dust: b * 0.8,
        smoke: Math.sin(idx * 0.1) * 0.5 + 0.5,
        seaSalt: Math.cos(idx * 0.12) * 0.4 + 0.5,
        sulfate: (earthPulse.frequencies[idx] - 180) / 580
      }))
    };
  }
};