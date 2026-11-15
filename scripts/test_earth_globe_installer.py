import unittest
from scripts.integrate_earth_globe import update_climate, update_scientific, update_temperature


class EarthGlobeInstallerTests(unittest.TestCase):
    def test_scientific_panel_replaces_coordinates(self):
        source = """import React, { useEffect, useRef, useState } from 'react';
      <form onSubmit={loadData} className=\"lg:grid-cols-5\">
        <label className=\"hello\">Latitude
          <input type=\"number\" value={latitude} />
        </label>
        <label className=\"hello\">Longitude
          <input type=\"number\" value={longitude} />
        </label>
      </form>"""
        result = update_scientific(source)
        self.assertIn('<GlobeLocationPicker', result)
        self.assertNotIn('>Latitude', result)
        self.assertIn('lg:grid-cols-3', result)
        self.assertEqual(update_scientific(result), result)

    def test_real_world_jsx_with_arrow_callbacks(self):
        source = """import React, { useEffect, useRef, useState } from 'react';
      <form onSubmit={loadData} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-medium text-[#71717A]">Latitude
          <input required aria-label="Scientific latitude" type="number" value={latitude} onChange={event => setLatitude(event.target.value)} className="bg-[#EFECE6]" />
        </label>
        <label className="text-xs font-medium text-[#71717A]">Longitude
          <input required aria-label="Scientific longitude" type="number" value={longitude} onChange={event => setLongitude(event.target.value)} className="bg-[#EFECE6]" />
        </label>
      </form>"""
        result = update_scientific(source)
        self.assertIn('<GlobeLocationPicker', result)
        self.assertNotIn('Scientific latitude" type="number"', result)
        self.assertNotIn('Scientific longitude" type="number"', result)
        self.assertIn('lg:grid-cols-3', result)
        self.assertEqual(update_scientific(result), result)

    def test_temperature_panel_replaces_coordinates(self):
        source = """import React, { useEffect, useRef, useState } from 'react';
      <form onSubmit={loadMeasurements} className=\"lg:grid-cols-5\">
        <label>Latitude <input value={latitude} /></label>
        <label>Longitude <input value={longitude} /></label>
      </form>"""
        result = update_temperature(source)
        self.assertIn('<GlobeLocationPicker', result)
        self.assertNotIn('>Longitude', result)
        self.assertEqual(update_temperature(result), result)

    def test_climate_panel_removes_original_coordinate_map(self):
        source = """import React, { useEffect, useRef, useState } from 'react';
      <form onSubmit={loadData} className=\"xl:grid-cols-5\">
        {[
          ['Latitude', latitude, setLatitude, -90, 90],
          ['Longitude', longitude, setLongitude, -180, 180]
        ].map(([label, value, update, min, max]) => (
          <label key={label}>{label}<input value={value} /></label>
        ))}
        {[
          ['Start (UTC)', start, setStart],
          ['End (UTC)', end, setEnd]
        ].map(([label]) => <label>{label}</label>)}
      </form>"""
        result = update_climate(source)
        self.assertIn('<GlobeLocationPicker', result)
        self.assertNotIn("['Latitude'", result)
        self.assertIn("['Start (UTC)'", result)
        self.assertEqual(update_climate(result), result)

    def test_missing_anchor_is_detected(self):
        with self.assertRaises(RuntimeError):
            update_scientific('import React;')


if __name__ == '__main__':
    unittest.main()
