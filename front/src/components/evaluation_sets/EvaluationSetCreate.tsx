import { type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import classNames from "classnames";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup } from "@headlessui/react";

import {
  EvaluationMode,
  type EvaluationSet,
  type EvaluationSetCreate,
  EvaluationSetCreateSchema,
} from "@/api/evaluation_sets";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs";

function RadioOption({
  checked,
  label,
  children,
}: {
  checked: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 text-center rounded border dark:bg-stone-800 dark:border-stone-700 bg-stone-200 border-stone-300 p-2 h-full w-48">
      <RadioGroup.Label
        as="p"
        className={classNames(
          "font-medium",
          checked ? "text-emerald-500" : "dark:text-stone-500",
        )}
      >
        {label}
      </RadioGroup.Label>
      <RadioGroup.Description
        as="span"
        className={classNames(
          "inline text-sm",
          checked ? "text-emerald-100" : "text-stone-600",
        )}
      >
        {children}
      </RadioGroup.Description>
    </div>
  );
}

function ClipClassification() {
  return (
    <div>
      Choose this if you want to assess the accuracy of categorizing entire
      audio clips into their appropriate classes.
    </div>
  );
}

function ClipMultiLabelClassification() {
  return (
    <div>
      Assess whether the assignment of multiple labels to each clip is accurate.
    </div>
  );
}

function SoundEventClassification() {
  return (
    <div>
      Evaluate the correctness of assigning classes to individual sound events.
    </div>
  );
}

function SoundEventDetection() {
  return (
    <div>
      Evaluate the precision of locating sound events and ensuring their correct
      classification.
    </div>
  );
}

const MODES = {
  [EvaluationMode.SOUND_EVENT_CLASSIFICATION]: {
    label: "Sound Event Classification",
    description: SoundEventClassification,
  },
  [EvaluationMode.SOUND_EVENT_DETECTION]: {
    label: "Sound Event Detection",
    description: SoundEventDetection,
  },
  [EvaluationMode.CLIP_CLASSIFICATION]: {
    label: "Clip Classification",
    description: ClipClassification,
  },
  [EvaluationMode.CLIP_MULTILABEL_CLASSIFICATION]: {
    label: "Clip Multi-Label Classification",
    description: ClipMultiLabelClassification,
  },
};

export default function EvaluationSetCreate({
  onCreate,
}: {
  onCreate?: (data: EvaluationSetCreate) => Promise<EvaluationSet>;
}) {
  const { control, handleSubmit, formState, register } = useForm<EvaluationSet>(
    {
      resolver: zodResolver(EvaluationSetCreateSchema),
      mode: "onChange",
    },
  );

  const { errors } = formState;

  const onSubmit = async (data: EvaluationSetCreate) => {
    if (onCreate) {
      toast.promise(onCreate(data), {
        loading:
          "Creating project. Please wait while the folder is scanned for recordings.",
        success: "Project created!",
        error: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        label="Evaluation Task"
        name="mode"
        error={errors.mode?.message}
      >
        <Controller
          name="mode"
          defaultValue={EvaluationMode.SOUND_EVENT_CLASSIFICATION}
          control={control}
          render={({ field }) => (
            <RadioGroup
              className="flex flex-row justify-center gap-4"
              {...field}
            >
              <RadioGroup.Label className="sr-only">
                Evaluation Mode
              </RadioGroup.Label>
              {Object.entries(MODES).map(([mode, data]) => (
                <RadioGroup.Option
                  key={mode}
                  value={mode}
                  className="rounded focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  {({ checked }) => (
                    <RadioOption checked={checked} label={data.label}>
                      <data.description />
                    </RadioOption>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          )}
        />
      </InputGroup>
      <InputGroup
        label="Name"
        name="name"
        help="Please provide a name this evaluation set."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </InputGroup>
      <InputGroup
        label="Description"
        name="description"
        help="Describe the purpose of this evaluation set."
        error={errors.description?.message}
      >
        <TextArea rows={6} {...register("description")} />
      </InputGroup>
      <Submit>Create Evaluation Set</Submit>
    </form>
  );
}
