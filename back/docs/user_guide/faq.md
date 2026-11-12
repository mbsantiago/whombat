# FAQ

## Starting Up Whombat

### I'm having trouble logging in. What should I do?

Whombat does not create a default account, so there is no standard username and password to fall back on.
Instead, the first person to open a fresh Whombat instance creates their own account:

1. **Open Whombat in your browser**: If no account exists yet, follow the **Create account** link on the login page, which takes you to the `/first` page.
      The startup message in the terminal points to the same address.
2. **Enter your details and choose a password**: This first account is automatically granted administrator rights.

If your instance already has users and you don't have an account, ask the person administering the instance to create one for you.

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
