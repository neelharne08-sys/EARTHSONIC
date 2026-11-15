
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
IMAGE_PATH = PROJECT_ROOT / "assets" / "nasa-eic-nightlights.jpg"


def analyze_image(image_path, samples=100, rows=70):
    with Image.open(image_path) as image:
        rgb_image = image.convert("RGB")

        original_width, original_height = rgb_image.size

        resized_image = rgb_image.resize(
            (samples, rows),
            Image.Resampling.BILINEAR
        )

        pixels = resized_image.get_flattened_data()

    brightness_values = []

    for x in range(samples):
        total_brightness = 0.0

        for y in range(rows):
            index = y * samples + x

            red, green, blue = pixels[index]

            brightness = (
                0.2126 * red
                + 0.7152 * green
                + 0.0722 * blue
            ) / 255

            total_brightness += brightness

        average_brightness = total_brightness / rows

        brightness_values.append(average_brightness)

    minimum = min(brightness_values)
    maximum = max(brightness_values)

    normalized_values = []

    for value in brightness_values:
        if maximum == minimum:
            normalized = 0.5
        else:
            normalized = (value - minimum) / (maximum - minimum)

        normalized_values.append(normalized)

    return {
        "width": original_width,
        "height": original_height,
        "samples": samples,
        "brightness_values": brightness_values,
        "normalized_values": normalized_values
    }


def main():
    if not IMAGE_PATH.exists():
        print("Error: NASA image not found.")
        return

    result = analyze_image(IMAGE_PATH)

    print("EarthPulse NASA Image Analysis")
    print("------------------------------")

    print(f"Image Width: {result['width']}")
    print(f"Image Height: {result['height']}")
    print(f"Total Samples: {result['samples']}")

    print("\nFirst 10 Brightness Samples:")

    for index, value in enumerate(
        result["normalized_values"][:10]
    ):
        print(f"Sample {index + 1}: {value:.4f}")

    print("\nImage analysis completed successfully.")


if __name__ == "__main__":
    main()
