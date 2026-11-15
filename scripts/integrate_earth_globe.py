from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS = ROOT / 'frontend' / 'src' / 'components'
NEW_COMPONENT = "import GlobeLocationPicker from './GlobeLocationPicker';"


def require_one(source, old, new, label):
    if source.count(old) != 1:
        raise RuntimeError(f'{label}: expected one source anchor, found {source.count(old)}')
    return source.replace(old, new, 1)


def insert_picker(source, form_pattern, label):
    if '<GlobeLocationPicker' in source:
        return source
    forms = list(re.finditer(form_pattern, source))
    if len(forms) != 1:
        raise RuntimeError(f'{label}: expected exactly one NASA science form')
    match = forms[0]
    picker = (
        '      <GlobeLocationPicker\n'
        '        latitude={latitude}\n'
        '        longitude={longitude}\n'
        '        onChange={({ latitude: nextLatitude, longitude: nextLongitude }) => {\n'
        '          setLatitude(nextLatitude);\n'
        '          setLongitude(nextLongitude);\n'
        '        }}\n'
        '      />\n\n'
    )
    return source[:match.start()] + picker + source[match.start():]


def strip_scalar_label(source, name, label):
    pattern = rf'\n[ \t]*<label\b[^\n]*>\s*{name}\s*<input\b[^\n]*?/>\s*</label>'
    source, count = re.subn(pattern, '', source, count=1)
    if count != 1:
        raise RuntimeError(f'{label}: unable to replace the {name} coordinate input')
    return source


def update_scientific(source):
    if '<GlobeLocationPicker' in source:
        return source
    source = strip_scalar_label(source, 'Latitude', 'ScientificJukebox')
    source = strip_scalar_label(source, 'Longitude', 'ScientificJukebox')
    source = require_one(source, 'lg:grid-cols-5', 'lg:grid-cols-3', 'ScientificJukebox responsive form')
    source = insert_picker(source, r'      <form onSubmit=\{loadData\}', 'ScientificJukebox')
    source = require_one(source, "import React, { useEffect, useRef, useState } from 'react';", "import React, { useEffect, useRef, useState } from 'react';\n" + NEW_COMPONENT, 'ScientificJukebox import')
    return source


def update_temperature(source):
    if '<GlobeLocationPicker' in source:
        return source
    source = strip_scalar_label(source, 'Latitude', 'NASATemperatureLab')
    source = strip_scalar_label(source, 'Longitude', 'NASATemperatureLab')
    source = require_one(source, 'lg:grid-cols-5', 'lg:grid-cols-3', 'Temperature form')
    source = insert_picker(source, r'      <form onSubmit=\{loadMeasurements\}', 'NASATemperatureLab')
    source = require_one(source, "import React, { useEffect, useRef, useState } from 'react';", "import React, { useEffect, useRef, useState } from 'react';\n" + NEW_COMPONENT, 'NASATemperatureLab import')
    return source


def update_climate(source):
    if '<GlobeLocationPicker' in source:
        return source
    coordinate_marker = "['Latitude', latitude, setLatitude, -90, 90]"
    date_marker = "['Start (UTC)', start, setStart]"
    start_index = source.find(coordinate_marker)
    end_index = source.find(date_marker)
    if start_index < 0 or end_index < 0 or start_index >= end_index:
        raise RuntimeError('NASAClimateLab: cannot find the coordinate and date field groups')
    start_group = source.rfind('        {[', 0, start_index)
    end_group = source.rfind('        {[', 0, end_index)
    if start_group < 0 or end_group < 0 or start_group >= end_group:
        raise RuntimeError('NASAClimateLab: cannot isolate the coordinate group')
    source = source[:start_group] + source[end_group:]
    source = require_one(source, 'xl:grid-cols-5', 'xl:grid-cols-3', 'Climate form')
    source = insert_picker(source, r'      <form onSubmit=\{loadData\}', 'NASAClimateLab')
    source = require_one(source, "import React, { useEffect, useRef, useState } from 'react';", "import React, { useEffect, useRef, useState } from 'react';\n" + NEW_COMPONENT, 'NASAClimateLab import')
    return source


FILES = {
    'ScientificJukebox.jsx': update_scientific,
    'NASATemperatureLab.jsx': update_temperature,
    'NASAClimateLab.jsx': update_climate
}


def main():
    changes = []
    for filename, transform in FILES.items():
        path = COMPONENTS / filename
        if not path.is_file():
            raise FileNotFoundError(f'Missing component: {path}')
        old = path.read_text(encoding='utf-8')
        new = transform(old)
        changes.append((path, old, new))
    for path, old, new in changes:
        if new != old:
            path.write_text(new, encoding='utf-8')
            print(f'Updated: {path.relative_to(ROOT)}')
        else:
            print(f'Already installed: {path.relative_to(ROOT)}')
    print('Interactive globe is integrated into all three NASA science panels.')


if __name__ == '__main__':
    main()
