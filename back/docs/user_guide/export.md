# Export Annotations for ML Development

Here we will show you how to export your annotations for model development.
We will showcase 3 ways to use your data to create custom bioacoustics detectors.

## Data formats

First, a bit about data formats.

The world of data formats is diverse.
In bioacoustics, commonly used formats include:

1. Praat text files
2. Audacity annotations
3. Raven annotations

However, these formats have limitations:

1. They don't export all necessary metadata, such as recording info, tags, and user actions.
2. They lack information on annotation completeness and can't indicate if a clip or whole recording was annotated.
3. They have rigid ways of representing the ROI of a sound event.

Whombat can export to these formats, but to preserve all annotation details and rich metadata, use our custom format, Acoustic Object Exchange Format (AOEF).
This JSON-based format retains most of the data needed for ML model development.

## Using audioclass

## Using batdetect2

## Using Opensoundscape
