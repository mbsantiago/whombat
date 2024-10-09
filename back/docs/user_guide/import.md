# Import Data to Whombat

**Whombat**'s import functionality is a key part of its ability to integrate with machine learning workflows.
It offers several advantages:

- **Collaboration and Sharing**: Easily share your work with others who have Whombat installed.
- **Leveraging Existing Data**: Jumpstart your annotation projects by importing existing data.
- **Closing the Loop with Machine Learning**: Import results and insights from your model development process back into Whombat.

This guide will provide a practical example of how to import data into Whombat.

## Getting Started with Example Data

To help you explore Whombat's import functionality and see it in action, we've prepared a set of example data.
This data includes:

- **Bat Echolocation Recordings**: 10 audio recordings of bat echolocation calls sourced from Xeno-canto, a comprehensive online database of bird and bat sounds.
- **Example Dataset**: A pre-defined dataset containing metadata for these recordings.
- **Example Annotation Project**: An annotation project based on the example dataset, complete with annotations of bat calls.
- **Example Evaluation Set**: An evaluation set derived from the annotation project, designed for assessing model performance.
- **Example Model Run**: A set of model predictions on the evaluation set, showcasing how model outputs can be integrated into Whombat.

By importing this example data, you can familiarize yourself with Whombat's interface and features without needing to create annotations from scratch.

## Downloading the Example Data

1. **Visit the Whombat Repository**: Navigate to the Whombat repository on GitHub: https://github.com/mbsantiago/whombat
2. **Download the Repository**: Click the green "Code" button and select "Download ZIP" from the dropdown menu.
      This will download the entire repository as a ZIP file to your computer.
3. **Extract the ZIP File**: Once the download is complete, extract the contents of the ZIP file.
4. **Locate the Example Data**: Inside the extracted folder, you'll find a directory named `example_data`.
      This folder contains all the example data files, including the audio recordings and JSON files for the dataset, annotation project, evaluation set, and model run.

Here's a preview of the files you'll find in the example_data folder:

```bash
.
├── audio
│   ├── LICENSE
│   ├── README.md
│   ├── XC820302-Noctilio_leporinus-2013.01.08-CL00088_A_15.wav
│   ├── XC821237-Centronycteris_centralis-2013.01.18-CL00331_B_10.wav
│   ├── XC821730-Rhynchonycteris_naso-2016.02.17-CL01709.wav
│   ├── XC821988-Lasiurus_blossevillii-2016.02.17-CL01712.wav
│   ├── XC823144-Desmodus_rotundus-2013.01.16-CL00262_A_30.wav
│   ├── XC824040-Carollia_castanea-2013.01.17-CL00312_A_15.wav
│   ├── XC826196-Carollia_perspicillata-2013.02.15-CL00827.wav
│   ├── XC826198-Carollia_sowelli-2013.02.15-CL00829.wav
│   ├── XC826219-Pteronotus_mesoamericanus-2013.02.15-CL00816.wav
│   └── XC882096-Diclidurus-albus_ind2.wav
├── example_annotation_project.json
├── example_dataset.json
├── example_evaluation_set.json
└── example_model_run.json
```

## Import the dataset

Let's begin the import process by bringing in the example dataset, which contains the audio recordings we'll be working with.

1. **Navigate to the Datasets Section**: Click on the "Datasets" button in the sidebar to access the datasets section.
      (Refer to the "Datasets" section of the user guide for more detailed navigation instructions.)
2. **Initiate the Import**: On the Datasets page, you'll find an "Import" button in the top right corner.
      Click this button to open the import dialog`.
3. **Provide the Required Information**: The import dialog requires two pieces of information:
   - Dataset File: Select the `example_dataset.json` file located in the `example_data` folder.
   - Audio Directory (`audio_dir`): Specify the full path to the directory containing the example audio recordings.
          For instance: `/home/user/Downloads/whombat/example_data/audio/`
4. **Import**: Once you've provided both the dataset file and the audio directory, click the "Import" button to begin the import process.

### Understanding the `audio_dir`

The `audio_dir` plays an important role in ensuring the portability and consistency of your data.
Dataset files store information about your recordings, including their file paths.
However, to make datasets easily transferable between different computers, these paths are stored relative to the `audio_dir`.

Think of the `audio_dir` as the root folder of your audio data.
As long as the internal folder structure within the `audio_dir` matches the relative paths stored in the dataset file, Whombat can successfully locate and import your recordings, regardless of where the `audio_dir` is located on your machine.

**Example**:

Imagine your audio recordings are organized in the following structure:

```bash
/home/user/example_data
├── other_documents
│   └── notes.txt
├── project1
│   ├── site1
│   │   ├── april
│   │   │   └── recording1.wav
│   │   └── june
│   │       └── recording2.wav
│   ├── site2
│   │   ├── july
│   │   │   └── recording3.wav
│   │   └── june
│   │       └── recording4.wav
│   └── site3
│       ├── august
│       │   └── recording6.wav
│       └── july
│           └── recording5.wav
└── project2
```

If you have a dataset file that references recordings within `project1`, and `project1` is your `audio_dir`, the entry for `recording1.wav` in the dataset file would have the relative path `site1/april/recording1.wav`.
When importing this dataset into Whombat, you would specify the full path to the audio_dir: `/home/user/example_data/project1/` By correctly specifying the `audio_dir`, you ensure that Whombat can accurately locate and import your recordings.

## Import the Annotation Project

Once the dataset is successfully imported, you can proceed with importing the annotation project.

1. **Navigate to the Annotation Projects Section**: Click the "Annotation Projects" button in the sidebar (second from the top).
2. **Open the Import Dialog**: On the Annotation Projects page, you'll see a list of existing projects and an "Import" button.
      Click this button to open the import dialog.
3. **Import the Project**: In the dialog, select the `example_annotation_project.json` file and click the "Import" button.
      The import process may take a few moments, especially for larger projects.
      Once the import is complete, you'll be redirected to the annotation project's detail page.

Take some time to explore the imported annotation project.
You can now utilize Whombat's exploration tools (accessible via the sidebar) to interact with the annotations and audio data.

!!! warning "Import the dataset first"

    It's crucial to import the dataset **before** importing the annotation project.
    This ensures that the recordings referenced in the annotation project are already registered in Whombat's database, allowing for a smooth import.

## Import the Evaluation Set

Importing the evaluation set follows a similar procedure:

1. **Navigate to the Evaluations Section**: Click the "Evaluations" button in the sidebar (third from the top).
2. **Open the Import Dialog**: On the Evaluations page, click the "Import" button to open the import dialog.
3. **Import the Evaluation Set**: Select the `example_evaluation_set.json` file and click the "Import" button.

Once the import is complete, you can explore the evaluation set and its associated data within Whombat.

## Importing a Model Run

Whombat allows you to import and evaluate model predictions by importing them as a "Model Run" within an Evaluation Set.
This enables you to compare your model's predictions against the ground truth annotations in the evaluation set and obtain a detailed performance report.

Here's how you can import a Model Run:

1. **Navigate to the Evaluations Section:** Click the "Evaluations" button in the sidebar (third from the top).
2. **Select the Evaluation Set:** Choose the evaluation set where you want to import the model run.
3. **Access the Model Run Page:** You can add a model run in two ways:
   - Click the "Add Model Run" button in the model run summary section.
   - Click the "Model Run" tab in the top navigation bar.
4. **Open the Import Dialog:** On the Model Run page, you'll see a list of existing model runs and an "Import" button.
      Click this button to open the import dialog.
5. **Import the Model Run:** Select the `example_model_run.json` file and click the "Import" button.

After importing the model run, you can initiate the evaluation process to assess its performance against the evaluation set.
Whombat will generate a comprehensive report, including overall scores, detailed metrics, and a breakdown of individual predictions.
You can then explore these results to gain insights into your model's strengths and weaknesses.
