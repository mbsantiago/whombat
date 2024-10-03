import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CloseIcon, TimeIcon } from "@/lib/components/icons";
import { Group, Input } from "@/lib/components/inputs";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import Popover from "@/lib/components/ui/Popover";

import useDebounceSubmit from "@/lib/hooks/forms/useDebounceSubmit";

function TimeButton({
  time,
  disabled,
}: {
  time?: string | null;
  disabled?: boolean;
}) {
  return (
    <Button mode="text" variant="secondary" padding="py-1" disabled={disabled}>
      <TimeIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
      {time != null ? (
        time
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-600">-</span>
      )}
    </Button>
  );
}

export default function RecordingTime({
  time,
  onChange,
  disabled = false,
}: {
  time?: string | null;
  onChange?: (value: { time?: string | null }) => void;
  disabled?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    disabled,
    mode: "onBlur",
    values: { time },
    resolver: zodResolver(
      z.object({
        time: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/, {
            message: "Time must be in hh:mm:ss.ddd format",
          })
          .nullable()
          .optional(),
      }),
    ),
  });

  const onSubmit = useCallback(
    (data: { time?: string | null }) => {
      onChange?.({ time: data.time === "" ? null : data.time });
    },
    [onChange],
  );

  useDebounceSubmit({
    onSubmit,
    watch,
    handleSubmit,
  });

  if (disabled) {
    return <TimeButton time={time} disabled />;
  }

  return (
    <Popover button={<TimeButton time={time} />}>
      {() => (
        <Card className="bg-stone-100 dark:bg-stone-800">
          <Group name="time" label="Time" error={errors.time?.message}>
            <Input
              type="text"
              {...register("time")}
              pattern="^([0-9]{2}:)?[0-9]{2}:[0-9]{2}(\.[0-9]{3})?$"
            />
          </Group>
          <Button
            mode="text"
            variant="danger"
            onClick={() => onChange?.({ time: null })}
          >
            <CloseIcon className="inline-block mr-1 w-5 h-5" />
            Clear
          </Button>
        </Card>
      )}
    </Popover>
  );
}
