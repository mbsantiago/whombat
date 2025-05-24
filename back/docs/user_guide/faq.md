# FAQ

## Starting Up Whombat

### I'm having trouble logging in. What should I do?

If you're logging into Whombat for the first time, you might not have a personalized username and password yet.
Don't worry, Whombat automatically sets up a default user during initialization.

To get started:

- Username: **admin**
- Password: **admin**

After your initial login, head over to your user profile to customize both your username and password to something more personalized and secure.

## Focusing on sounds

### Can I isolate sounds within specific frequency range?

If you know your target sounds fall within a specific frequency range, you can apply a bandpass filter to focus your attention and filter out extraneous noise.

To do this:

1. **Access Spectrogram Settings**: Locate the Spectrogram Settings within the annotation interface.
      (You may need to refer to the [Spectrogram Settings](guides/spectrogram_display.md#spectrogram-settings) section of the documentation for the precise location).
2. **Apply Bandpass Filter**: Adjust the filter settings to define your desired frequency range.

!!! tip "Additional tips"

    **Experiment with Filter Settings**: Try different frequency ranges to find the optimal settings for isolating your target sounds.
    **Combine with Denoising**: Use the denoising feature in conjunction with filtering to further enhance clarity.

## Ultrasonic recordings

### I have time expanded recordings, can I use them?

Whombat fully supports time-expanded audio recordings, commonly used in bioacoustics research to analyze high-frequency vocalizations like bat calls.
While Whombat assumes recordings are not time-expanded by default, you can easily adjust for this:

1. **Navigate to the Recording Detail Page**: Access the page dedicated to the specific recording you want to work with.
2. **Update Time Expansion Factor**: In the recording media info, you'll find an option to specify the "Time Expansion Factor" used during recording.
      Enter the correct value here.

!!! warning "Adjust the time expansion early"

    Set the time expansion factor as soon as you upload a time-expanded recording to ensure accurate frequency calculations from the start.

??? tip "Restoring the original samplerate"

    While it's possible to unexpand recordings (refer to the [bats section](https://xeno-canto.org/help/FAQ#bats) of the xeno-canto documentation for tips), Whombat allows you to work directly with time-expanded recordings without altering the original data. We recommend this approach as it maintains the integrity of your source material and provides a clear record of how the recording was created.

## Import and Export

### What is the AOEF format?

The AOEF format is a custom data format designed for integration with Whombat data.
It is outlined in the `soundevent` package, and for a more in-depth understanding, we suggest checking out their [documentation](https://mbsantiago.github.io/soundevent/).
In simple terms, it's a [JSON](https://www.json.org)-based format, drawing heavy inspiration from the [COCO dataset](https://cocodataset.org/#format-data) format.

\*[AOEF]: Acoustic Object Exchange Format
