# Welcome to Whombat

![Whombat Logo](assets/logo.svg)

Welcome to the _Whombat_ documentation, your go-to resource for understanding and utilizing this open-source audio annotation tool tailored for ML development.

If you're eager to dive into using Whombat, explore the [User Guide](user_guide/index.md) for comprehensive instructions.

## Why Whombat?

In the realm of audio analysis tools, numerous options exist, each with its specific strengths.
Tools like [Raven](https://www.ravensoundsoftware.com/) and [Audacity](https://www.audacityteam.org/) excel at audio analysis but might fall short when it comes to the specialized needs of audio annotation for machine learning development.
Whombat bridges this gap by focusing on the following key requirements:

1. **Evolving Datasets**: Whombat empowers you to build and manage enduring datasets of audio recordings, accommodating changes and updates as your project evolves.

2. **Structured Annotation Projects**: Create well-defined annotation projects, complete with clear instructions and tasks.
      Track progress and ensure consistency across your team.

3. **Annotation Review**: Thoroughly examine and validate existing annotations to maintain data quality.

4. **Import/Export Flexibility**: Import and export annotations in various formats, facilitating collaboration and integration with other tools.

5. **Flexible Annotation**: Annotate sounds with precision, specifying Regions of Interest (ROIs) using bounding boxes, intervals, or other methods.
      Attach rich metadata to annotations, including tags and notes.

6. **Sound Exploration**: Explore your sound collection to uncover patterns and gain insights.
      Facilitate sound identification and classification through interactive tools.

7. **Model Comparison**: Compare model outputs with human annotations to identify areas where your model is underperforming and pinpoint where additional annotation is needed.

_Whombat_'s design prioritizes **careful, manual data curation**.
We believe this emphasis on precision will enable the community to build gold-standard bioacoustic datasets, fueling the development of cutting-edge machine learning models.

## New to Whombat?

Get started quickly with these resources:

1. **Install:** Follow the [installation instructions](user_guide/installation.md) to set up Whombat on your machine.
2. **Explore:** Dive into the [user guide](user_guide/index.md) and familiarize yourself with Whombat's features, including:
       - [Datasets](user_guide/datasets.md): Learn how to manage and organize your recordings and their metadata.
       - [Annotation Projects](user_guide/annotation_projects.md): Create and manage annotation projects.
       - [Evaluation Sets](user_guide/evaluation.md): Evaluate model and user predictions and compare against annotated data.
       - [Exploration Tools](user_guide/exploration.md): Discover whombat's tools for data exploration.
3. **Import Data:** Get hands-on with example data to experience Whombat's capabilities ([import guide](user_guide/import.md)).
4. **Learn More:** Deepen your understanding with detailed guides:
       - [Spectrogram Display](user_guide/spectrogram_display.md): Tune the spectrogram display to visualize your recordings.
       - [Annotation Export](user_guide/export.md): Export your annotations for machine learning development.
5. **Questions?** Check out the [FAQ](user_guide/faq.md).

## Learn more

For those keen on delving into the internal workings of _Whombat_, integrating it with Python scripts, or contributing to its development, keep an eye on the upcoming [Developer Guide](developer_guide/index.md).
Additionally, find detailed technical documentation in the [Reference](reference/api.md) section.
Check out the [Contributing](CONTRIBUTING.md) section to learn how you can contribute to the Whombat community.

!!! warning

    Please bear with us, as this documentation is a work in progress, and we're working hard to smooth out any rough edges.
