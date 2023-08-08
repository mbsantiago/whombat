Glossary
========

This is a glossary of terms used within Whombat.

.. glossary::

   Dataset
      A dataset is a collection of audio :term:`Recordings<Recording>` that are
      grouped together within a single directory. The purpose of a dataset is
      to organize and group recordings that belong together, such as all
      recordings from a single deployment or field study. Usually, recordings
      within a dataset are made by the same group of people, using similar
      equipment, and following a predefined protocol. However, this is not a
      strict requirement.

      Each dataset can be named and described, making it easier to identify and
      manage multiple datasets within Whombat. Users can add new datasets to
      Whombat and import recordings into them, or remove datasets and their
      associated recordings.

   Recording
      A recording is the primary source of data in Whombat, representing a
      single audio file. Currently, Whombat supports only WAV files, although
      support for additional file formats may be added in the future.
      Recordings are part of a :term:`Dataset`, and each recording has a unique
      identifier (UUID) and a path that points to the audio file relative to
      the dataset root directory.

      When a recording is registered, its metadata is scanned and retrieved,
      and this information is stored within Whombat. This metadata includes the
      duration of the recording, its sample rate, and the number of channels.
      Additionally, recordings can optionally include date and time information
      to indicate when they were recorded, as well as latitude and longitude
      coordinates to indicate where they were recorded.

   Clip
      A clip is a contiguous fragment of a :term:`Recording`, defined by its
      start and end times. While recordings are the base
      source of information, clips are the unit of work in Whombat. When
      annotating audio, users are provided with a clip to annotate, rather than
      the entire recording. Similarly, machine learning models are typically
      run on audio clips instead of whole recordings. There are several reasons
      for this. Firstly, working with very long audio files can be prohibitive
      both for visualizing and annotating. Secondly, standardizing the duration
      of clips makes it easier to perform consistent and comparable annotations
      across different recordings. Finally, many machine learning models
      process audio files in clips and generate a prediction per clip, making
      it logical to adopt this structure in Whombat. By working with clips,
      users can also easily focus on specific parts of the recording, and
      identify relevant :term:`Sound Events<Sound Event>` with greater ease.

   Sound Event
      Sound events are the heart of Whombat, as they are the primary objects of
      annotation. A sound event is any distinguishable sound within a
      :term:`Recording` that is of interest to users. Whombat allows users to
      efficiently find and annotate relevant sound events, which can then be
      used to generate machine learning models for automatic detection.

      A :term:`Recording` can have multiple sound events, or none at all. To
      annotate a sound event, the user marks the region within the spectrogram
      to which it is confined. There are several ways to mark the region, such
      as by indicating the timestamp for the onset of the sound event,
      indicating when the sound event starts and stops, or providing very
      detailed information about which time and frequency regions belong to the
      sound event.

      Each sound event has a type, depending on the geometry type of the mark,
      such as point, line, or rectangle. The geometry of the mark itself is
      also recorded, allowing for detailed information about the sound event to
      be stored. For example, if the mark is a rectangle, information about the
      frequency range and duration of the sound event can be recorded.

      Whombat also allows for the addition of :ref:`Tags<Tag>`to sound events,
      providing additional information about the sound event. :ref:`Tags` can
      include information such as the species that emitted the sound, the
      behavior the emitter was displaying, or the syllable type of the sound.
      By annotating a sufficiently large and diverse set of sound events,
      Whombat can help users efficiently generate machine learning models that
      can detect these events automatically.

   Tag
      Tags are used throughout the Whombat to attach special meaning to
      objects. They provide a flexible way for users to add additional
      information and metadata to :term:`Recordings<Recording>`,
      :term:`Clips<Clip>`, and :term:`Sound Events<Sound Event>`.

      Tags can be attached to :term:`Recordings<Recording>` to provide extra
      information about the recording, such as the vegetation type of the
      surrounding recording site, the device used to generate the recording, or
      the name of the protocol used to record. This information can be used to
      organize recordings and make it easier to find and filter specific
      recordings within a dataset.

      Tags can also be attached to recording :term:`Clips<clip>` to highlight
      different aspects of the acoustic content. For example, they can be used
      to list all the species that were found within a clip, to indicate that
      the clip is noisy, or to classify the soundscape into a single category.

      Finally, tags can also be attached to individual :term:`Sound
      Events<Sound Event>` within a recording. These tags provide a way to
      describe the sound event in greater detail and add additional metadata to
      it. For example, tags can be used to indicate the species that emitted
      the sound, providing valuable information for species identification and
      analysis. Users can also attach tags to indicate the behavior the emitter
      was displaying, such as mating, territorial, or alarm calls. In addition,
      tags can be used to indicate whether the sound is a particular syllable
      within a larger vocalization, such as syllable A or B. This allows users
      to analyze vocalizations at a more granular level and provides additional
      information for vocalization classification and analysis.

      Each tag is defined by a key-value pair. The key helps group several tags
      into coherent categories, making it easier to organize and filter the
      tags within Whombat. There are no restrictions on what can be a key or
      value, so users are encouraged to carefully consider which tags they need
      to use in their projects.

      Tags provide a flexible way to add additional information and metadata to
      audio recordings and their associated objects within Whombat. By
      attaching tags to these objects, users can more easily organize, filter,
      and analyze audio data, making it simpler to extract meaningful insights
      and information.

