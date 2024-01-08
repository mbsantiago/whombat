# Evaluation

While the primary focus of Whombat revolves around annotation work, we
acknowledge that annotation is just one facet of the ML development workflow.
Whombat aims to enhance this workflow by not only providing tools for generating
annotations but also offering features to comprehend the performance of ML
models trained with these annotations.

In this section, we will delve into leveraging the annotations created through
your efforts to evaluate and explore ML model and annotator predictions. The
topics we will cover include:

1. [Understanding predictions](#understanding-predictions)
2. [Evaluation Sets](#evaluation-sets)
3. [Creating or Importing an Evaluation Set](#creating-or-importing-an-evaluation-set)
4. Selecting Evaluation Tags
5. Adding Examples to the Evaluation Set
6. Importing a Model Run
7. Creating a User Training Session
8. Evaluating a set of predictions
9. Exploring the predictions

## Understanding Predictions

In Whombat, predictions share similarities with
[annotations](annotation_projects.md#understanding-annotation). Like
annotations, predictions exist in two forms: **sound event** and **clip
predictions**. Predicted sound events encompass a Region of Interest (RoI)
suspected to contain a relevant sound, along with associated tags. On the other
hand, clip predictions consist of tags that potentially match the audio content
of the clip, along with the predicted sound events within the clip. Noteworthy
differences from regular annotations include a somewhat philosophical
stance—predictions are generally considered less trustworthy than annotations.
Additionally, predictions often come with a quantification of certainty.

In Whombat, sound event predictions feature an accompanying **confidence
score**, aiming to quantify the level of certainty the ML model or user has
regarding the presence of that sound event. Predicted tags also carry a
confidence score. For instance, a predicted sound event could be associated with
two tags: "sound:Airplane" with a confidence score of 80% and "sound:Human" with
a confidence score of 20%. Importantly, this combination doesn't create a
contradiction; instead, it provides nuanced insights into the confidence levels
associated with each predicted tag.

Sets of predictions are organized into **Model Runs** or **User Runs**. These
collections gather predictions created with the same model or by the same user,
under identical configurations and singular conditions. These prediction sets
can then be evaluated against the ground truth.

## Evaluation Sets

In the evaluation process, it's common to assess a model or user by comparing
their predictions against a set of known examples. To facilitate this, Whombat
has organized the entire evaluation module around the concept of **evaluation
sets**.

An evaluation set is essentially a curated collection of fully annotated audio
clips. These clips serve as benchmark examples for comparing predictions.
Evaluation sets can be sourced from existing annotation projects or directly
imported from other sources. Similar to annotation sets, evaluation sets often
concentrate on specific types of sounds. Therefore, an evaluation set is
associated with a set of tags that define the focus areas for assessment.

![Side Bar](../assets/img/side_bar.png)

To begin working with an evaluation set, click on the Evaluation button on the
sidebar (labeled **C** in the figure) or use the navigation cards on the
homepage. Here, you'll find a list of existing evaluation sets. You can search
for a particular set using the search bar or create a new one. Clicking on a set
provides detailed insights into its contents.

![Evaluation Set List](../assets/img/evaluation_set_list.png)

## Creating or Importing an Evaluation Set

To create a new evaluation set, click on the **+Create** button at the top
right. You will be prompted to provide a name and a description for the
evaluation set.

Alternatively, if you already have an evaluation set saved in an AOEF file, you
can import it directly by clicking on the **Import** button and selecting the
appropriate file.

??? tip "Creating AOEF files"

    For an efficient way to generate AOEF files with your own data, we
    recommend using the [`soundevent`](https://mbsantiago.github.io/soundevent/)
    package. This package offers user-friendly functions aligned with Whombat's
    data structure, facilitating a seamless integration process.

Once created or imported, you will be redirected to the Evaluation Set Dashboard
for further management and exploration.

## The Evaluation Set Dashboard

The Evaluation Set Dashboard offers a concise summary of key information related
to the evaluation set and its associated elements. The overview section provides
a snapshot, displaying the count of registered examples, the number of tags
utilized for evaluation, and the tally of model runs and user sessions imported
for this specific evaluation set.

Within the dashboard, you'll find details about the most recent model and user
runs, along with insights into their respective evaluations. Additionally,
information about the evaluation set, including its description and name, is
readily accessible and editable.

!!! tip "Downloading the Evaluation Set"

    Clicking the **Download** button in the dashboard allows you to download
    the evaluation set information. This download includes details about the
    contained clips and their corresponding ground truth annotations. This
    information proves valuable for extracting the corresponding audio material and
    running a model to create a Model Run.

??? warning "Deleting the Evaluation Set"

    Exercise caution when using the **Delete** button, as it will permanently
    remove the evaluation set. This action includes the deletion of any associated
    model and user runs, along with their respective evaluations. Ensure you are
    certain about this decision or have appropriate backups in place.

## Selecting Evaluation Tags
