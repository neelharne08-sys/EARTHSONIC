
from backend.image_processing import IMAGE_PATH, analyze_image


def brightness_to_frequency(brightness):
    brightness = max(0.0, min(1.0, brightness))

    frequency = 180 + (580 * brightness)

    return round(frequency, 2)


def generate_sonification(image_path):
    analysis = analyze_image(image_path)

    normalized_values = analysis["normalized_values"]

    frequencies = []

    for brightness in normalized_values:
        frequency = brightness_to_frequency(brightness)
        frequencies.append(frequency)

    return {
        "samples": analysis["samples"],
        "brightness": normalized_values,
        "frequencies": frequencies,
        "minimum_frequency": min(frequencies),
        "maximum_frequency": max(frequencies)
    }


def main():
    result = generate_sonification(IMAGE_PATH)

    print("EarthPulse Sonification Engine")
    print("-----------------------------")
    print(f"Total Samples: {result['samples']}")

    print("\nFirst 10 Sound Frequencies:")

    for index, frequency in enumerate(result["frequencies"][:10]):
        print(f"Sample {index + 1}: {frequency} Hz")

    print(f"\nMinimum Frequency: {result['minimum_frequency']} Hz")
    print(f"Maximum Frequency: {result['maximum_frequency']} Hz")

    print("\nSonification parameters generated successfully.")


if __name__ == "__main__":
    main()
