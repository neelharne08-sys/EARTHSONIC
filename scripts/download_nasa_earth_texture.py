from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
from PIL import Image

NASA_BLUE_MARBLE_URL = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg'
OUTPUT = Path('frontend/public/earthsonic-earth-nasa.jpg')


def main():
    if OUTPUT.is_file() and OUTPUT.stat().st_size > 100000:
        print('NASA Blue Marble texture already installed:', OUTPUT)
        return
    print('Downloading NASA Blue Marble from official NASA website...')
    request = Request(NASA_BLUE_MARBLE_URL, headers={'User-Agent': 'Earthsonic-NASA-SpaceApps/1.0'})
    try:
        with urlopen(request, timeout=25) as response:
            raw = response.read(16 * 1024 * 1024)
        image = Image.open(BytesIO(raw))
        if image.width < 2000 or abs(image.width / image.height - 2) > 0.12:
            raise RuntimeError('NASA texture did not have an expected equirectangular aspect ratio')
        image = image.convert('RGB').resize((2400, 1200), Image.Resampling.LANCZOS)
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        image.save(OUTPUT, format='JPEG', quality=88, optimize=True, progressive=True)
        print(f'Saved NASA Blue Marble {image.width}x{image.height}: {OUTPUT} ({OUTPUT.stat().st_size//1024} KB)')
    except Exception as error:
        print('NASA texture download failed:', error)
        print('The existing map texture remains available as the fallback globe.')
        print('Open the NASA Blue Marble page and save a 2:1 global JPEG manually as:')
        print(OUTPUT)
        print('NASA source:', NASA_BLUE_MARBLE_URL)


if __name__ == '__main__':
    main()
