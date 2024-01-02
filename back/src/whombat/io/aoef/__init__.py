"""AOEF IO module.

Functions for importing and exporting data from and to the AOEF format.
For more details on the AOEF format, see
https://mbsantiago.github.io/soundevent/
"""

from whombat.io.aoef.annotation_projects import import_annotation_project
from whombat.io.aoef.datasets import import_dataset
from whombat.io.aoef.evaluation_sets import import_evaluation_set

__all__ = [
    "import_dataset",
    "import_annotation_project",
    "import_evaluation_set",
]
