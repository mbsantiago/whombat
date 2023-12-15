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
        members: None

### Tags

::: whombat.models.Tag
    options:
        heading_level: 4
        members: None

### Features

::: whombat.models.FeatureName
    options:
        members: None
        heading_level: 4

### Notes

::: whombat.models.Note
    options:
        heading_level: 4
        members: None

## Audio Content

### Recordings

::: whombat.models.Recording
    options:
        heading_level: 4
        members: None

::: whombat.models.RecordingTag
    options:
        heading_level: 4
        members: None

::: whombat.models.RecordingNote
    options:
        heading_level: 4
        members: None

::: whombat.models.RecordingFeature
    options:
        heading_level: 4
        members: None

::: whombat.models.RecordingOwner
    options:
        heading_level: 4
        members: None

### Datasets

::: whombat.models.Dataset
    options:
        heading_level: 4
        members: None

::: whombat.models.DatasetRecording
    options:
        heading_level: 4
        members: None

## Acoustic Objects

### Sound Events

::: whombat.models.SoundEvent
    options:
        heading_level: 4
        members: None

::: whombat.models.SoundEventFeature
    options:
        heading_level: 4
        members: None

### Clips

::: whombat.models.Clip
    options:
        heading_level: 4
        members: None

::: whombat.models.ClipFeature
    options:
        heading_level: 4
        members: None

## Annotation

### Sound Event Annotation

::: whombat.models.SoundEventAnnotation
    options:
        heading_level: 4
        members: None

::: whombat.models.SoundEventAnnotationTag
    options:
        heading_level: 4
        members: None

::: whombat.models.SoundEventAnnotationNote
    options:
        heading_level: 4
        members: None

### Clip Annotation

::: whombat.models.ClipAnnotation
    options:
        heading_level: 4
        members: None

::: whombat.models.ClipAnnotationTag
    options:
        heading_level: 4
        members: None

::: whombat.models.ClipAnnotationNote
    options:
        heading_level: 4
        members: None

### Annotation Task

::: whombat.models.AnnotationTask
    options:
        heading_level: 4
        members: None

::: whombat.models.AnnotationStatusBadge
    options:
        heading_level: 4
        members: None

### Annotation Project

::: whombat.models.AnnotationProject
    options:
        heading_level: 4
        members: None

::: whombat.models.AnnotationProjectTag
    options:
        heading_level: 4
        members: None

## Prediction

### Sound Event Prediction

::: whombat.models.SoundEventPrediction
    options:
        heading_level: 4
        members: None

::: whombat.models.SoundEventPredictionTag
    options:
        heading_level: 4
        members: None

### Clip Prediction

::: whombat.models.ClipPrediction
    options:
        heading_level: 4
        members: None

::: whombat.models.ClipPredictionTag
    options:
        heading_level: 4
        members: None

### Model Run

::: whombat.models.ModelRun
    options:
        heading_level: 4
        members: None

### User Run

::: whombat.models.UserRun
    options:
        heading_level: 4
        members: None

## Evaluation

### Sound Event Evaluation

::: whombat.models.SoundEventEvaluation
    options:
        heading_level: 4
        members: None

::: whombat.models.SoundEventEvaluationMetric
    options:
        heading_level: 4
        members: None

### Clip Evaluation

::: whombat.models.ClipEvaluation
    options:
        heading_level: 4
        members: None

::: whombat.models.ClipEvaluationMetric
    options:
        heading_level: 4
        members: None

### Evaluation

::: whombat.models.Evaluation
    options:
        heading_level: 4
        members: None

::: whombat.models.EvaluationMetric
    options:
        heading_level: 4
        members: None

### Evaluation Set

::: whombat.models.EvaluationSet
    options:
        heading_level: 4
        members: None

::: whombat.models.EvaluationSetTag
    options:
        heading_level: 4
        members: None

::: whombat.models.EvaluationSetAnnotation
    options:
        heading_level: 4
        members: None
