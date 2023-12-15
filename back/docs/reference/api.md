# Whombat Python API

Welcome to the Whombat Python API reference page. This section provides a
comprehensive guide to all the functions available through the `whombat.api`
module, designed to simplify the use of Whombat objects without the need to
handle the intricacies of SQLAlchemy internals.

The API is organized into distinct submodules, each corresponding to a crucial
data object within Whombat. Each sub-API contains functions tailored for
interactions with that specific type of object.

## Getting Started

To get started, follow the example below, which demonstrates how to use these functions:

```python
from whombat import api

async def main():
    # Create a session
    async with api.create_session() as session:
        # Example 1: Get or create a tag
        tag = await api.tags.get_or_create(session, key="species", value="Myotis myotis")

        # Example 2: Retrieve a recording by path
        recording = await api.recordings.get_by_path(session, path="<path_to_file>")

        # Example 3: Add a tag to a recording
        recording = await api.recordings.add_tag(session, recording, tag)
```

!!! info "Async functions"

    Most functions in the Whombat API are asynchronous. This design choice enhances
    code efficiency, particularly since many operations involve database
    transactions that can potentially slow down the program if executed
    synchronously.

On this page, you can explore all the submodules available and the functions
they provide. It's worth noting that each submodule is an instance of a BaseAPI
class, which manages an internal cache to minimize unnecessary database
queries. To access the reference for a specific submodule, such as
`api.sound_events`, please consult the corresponding class, in this case,
[`SoundEventAPI`][whombat.api.sound_events.SoundEventAPI], to discover all the available functions.

::: whombat.api

::: whombat.api.users.UserAPI
    options:
        inherited_members: true

::: whombat.api.tags.TagAPI
    options:
        inherited_members: true

::: whombat.api.features.FeatureNameAPI
    options:
        inherited_members: true

::: whombat.api.notes.NoteAPI
    options:
        inherited_members: true

::: whombat.api.recordings.RecordingAPI
    options:
        inherited_members: true

::: whombat.api.datasets.DatasetAPI
    options:
        inherited_members: true

::: whombat.api.sound_events.SoundEventAPI
    options:
        inherited_members: true

::: whombat.api.clips.ClipAPI
    options:
        inherited_members: true

::: whombat.api.sound_event_annotations.SoundEventAnnotationAPI
    options:
        inherited_members: true

::: whombat.api.clip_annotations.ClipAnnotationAPI
    options:
        inherited_members: true

::: whombat.api.annotation_tasks.AnnotationTaskAPI
    options:
        inherited_members: true

::: whombat.api.annotation_projects.AnnotationProjectAPI
    options:
        inherited_members: true

::: whombat.api.sound_event_predictions.SoundEventPredictionAPI
    options:
        inherited_members: true

::: whombat.api.clip_predictions.ClipPredictionAPI
    options:
        inherited_members: true

::: whombat.api.model_runs.ModelRunAPI
    options:
        inherited_members: true

::: whombat.api.user_runs.UserRunAPI
    options:
        inherited_members: true

::: whombat.api.sound_event_evaluations.SoundEventEvaluationAPI
    options:
        inherited_members: true

::: whombat.api.clip_evaluations.ClipEvaluationAPI
    options:
        inherited_members: true

::: whombat.api.evaluations.EvaluationAPI
    options:
        inherited_members: true

::: whombat.api.evaluation_sets.EvaluationSetAPI
    options:
        inherited_members: true
