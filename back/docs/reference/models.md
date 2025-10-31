# Database Models

Welcome to the comprehensive database models reference for **Whombat**! Here, you'll
discover an organized collection of all the database models defined within the
Whombat framework. Our categorization mirrors the structure outlined in
[`soundevent`](https://mbsantiago.github.io/soundevent/data_schemas/).

The models within **Whombat** share an analogical relationship with those in
`soundevent` and are essentially a **SQLAlchemy** port. While the core concepts remain
consistent, it's essential to note that some minor differences do exist.

## Data Descriptors

### Users

::: whombat.models.User
    options:
        heading_level: 4
        members: []

### Tags

::: whombat.models.Tag
    options:
        heading_level: 4
        members: []

### Features

::: whombat.models.FeatureName
    options:
        members: []
        heading_level: 4

### Notes

::: whombat.models.Note
    options:
        heading_level: 4
        members: []

## Audio Content

### Recordings

::: whombat.models.Recording
    options:
        heading_level: 4
        members: []

::: whombat.models.RecordingTag
    options:
        heading_level: 4
        members: []

::: whombat.models.RecordingNote
    options:
        heading_level: 4
        members: []

::: whombat.models.RecordingFeature
    options:
        heading_level: 4
        members: []

::: whombat.models.RecordingOwner
    options:
        heading_level: 4
        members: []

### Datasets

::: whombat.models.Dataset
    options:
        heading_level: 4
        members: []

::: whombat.models.DatasetRecording
    options:
        heading_level: 4
        members: []

## Acoustic Objects

### Sound Events

::: whombat.models.SoundEvent
    options:
        heading_level: 4
        members: []

::: whombat.models.SoundEventFeature
    options:
        heading_level: 4
        members: []

### Clips

::: whombat.models.Clip
    options:
        heading_level: 4
        members: []

::: whombat.models.ClipFeature
    options:
        heading_level: 4
        members: []

## Annotation

### Sound Event Annotation

::: whombat.models.SoundEventAnnotation
    options:
        heading_level: 4
        members: []

::: whombat.models.SoundEventAnnotationTag
    options:
        heading_level: 4
        members: []

::: whombat.models.SoundEventAnnotationNote
    options:
        heading_level: 4
        members: []

### Clip Annotation

::: whombat.models.ClipAnnotation
    options:
        heading_level: 4
        members: []

::: whombat.models.ClipAnnotationTag
    options:
        heading_level: 4
        members: []

::: whombat.models.ClipAnnotationNote
    options:
        heading_level: 4
        members: []

### Annotation Task

::: whombat.models.AnnotationTask
    options:
        heading_level: 4
        members: []

::: whombat.models.AnnotationStatusBadge
    options:
        heading_level: 4
        members: []

### Annotation Project

::: whombat.models.AnnotationProject
    options:
        heading_level: 4
        members: []

::: whombat.models.AnnotationProjectTag
    options:
        heading_level: 4
        members: []

## Prediction

### Sound Event Prediction

::: whombat.models.SoundEventPrediction
    options:
        heading_level: 4
        members: []

::: whombat.models.SoundEventPredictionTag
    options:
        heading_level: 4
        members: []

### Clip Prediction

::: whombat.models.ClipPrediction
    options:
        heading_level: 4
        members: []

::: whombat.models.ClipPredictionTag
    options:
        heading_level: 4
        members: []

### Model Run

::: whombat.models.ModelRun
    options:
        heading_level: 4
        members: []

### User Run

::: whombat.models.UserRun
    options:
        heading_level: 4
        members: []

## Evaluation

### Sound Event Evaluation

::: whombat.models.SoundEventEvaluation
    options:
        heading_level: 4
        members: []

::: whombat.models.SoundEventEvaluationMetric
    options:
        heading_level: 4
        members: []

### Clip Evaluation

::: whombat.models.ClipEvaluation
    options:
        heading_level: 4
        members: []

::: whombat.models.ClipEvaluationMetric
    options:
        heading_level: 4
        members: []

### Evaluation

::: whombat.models.Evaluation
    options:
        heading_level: 4
        members: []

::: whombat.models.EvaluationMetric
    options:
        heading_level: 4
        members: []

### Evaluation Set

::: whombat.models.EvaluationSet
    options:
        heading_level: 4
        members: []

::: whombat.models.EvaluationSetTag
    options:
        heading_level: 4
        members: []

::: whombat.models.EvaluationSetAnnotation
    options:
        heading_level: 4
        members: []
