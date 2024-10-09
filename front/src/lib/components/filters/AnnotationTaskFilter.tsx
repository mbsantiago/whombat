import * as input from "@/lib/components/inputs";
import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

import { TagSearchBarProps } from "../tags/TagSearchBar";

export default function AnnotationTaskFilter({
  filter,
  onChangeField,
  onClearField,
  TagSearchBar,
}: {
  filter: types.AnnotationTaskFilter;
  onChangeField?: types.FilterFieldSet<types.AnnotationTaskFilter>;
  onClearField?: types.FilterFieldClear<types.AnnotationTaskFilter>;
  TagSearchBar?: (props: TagSearchBarProps) => JSX.Element;
}) {
  return (
    <ui.Card>
      <div className="flex flex-row flex-wrap">
        <TaskStatusFilters
          filter={filter}
          onClearField={onClearField}
          onChangeField={onChangeField}
        />
      </div>
      <div className="flex flex-row flex-wrap">
        <RecordingTagFilter
          filter={filter}
          onClearField={onClearField}
          onChangeField={onChangeField}
          TagSearchBar={TagSearchBar}
        />
      </div>
    </ui.Card>
  );
}

function TaskStatusFilters({
  filter,
  onChangeField,
  onClearField,
}: {
  filter: types.AnnotationTaskFilter;
  onChangeField?: types.FilterFieldSet<types.AnnotationTaskFilter>;
  onClearField?: types.FilterFieldClear<types.AnnotationTaskFilter>;
}) {
  return (
    <div className="flex flex-row gap-4">
      <input.Group name="complete" label="Completed">
        <input.ToggleButton
          checked={filter.completed}
          onChange={(complete) => onChangeField?.("completed", complete)}
          onClear={() => onClearField?.("completed")}
        />
      </input.Group>
      <input.Group name="issues" label="Has issues">
        <input.ToggleButton
          checked={filter.rejected}
          onChange={(complete) => onChangeField?.("rejected", complete)}
          onClear={() => onClearField?.("rejected")}
        />
      </input.Group>
      <input.Group name="verified" label="Is verified">
        <input.ToggleButton
          checked={filter.verified}
          onChange={(complete) => onChangeField?.("verified", complete)}
          onClear={() => onClearField?.("verified")}
        />
      </input.Group>
    </div>
  );
}

function RecordingTagFilter({
  filter,
  onChangeField,
  onClearField,
  TagSearchBar,
  ...props
}: {
  filter: types.AnnotationTaskFilter;
  onChangeField?: types.FilterFieldSet<types.AnnotationTaskFilter>;
  onClearField?: types.FilterFieldClear<types.AnnotationTaskFilter>;
  TagSearchBar?: (props: TagSearchBarProps) => JSX.Element;
} & Omit<TagSearchBarProps, "onSelectTag">) {
  return (
    <div className="flex flex-row gap-4">
      <input.Group
        name="recording_tag"
        label="Recording Tag"
        help="Select a tag to select annotation tasks that were sourced from a recording with the provided tag."
      >
        {TagSearchBar && (
          <TagSearchBar
            onSelectTag={(tag) => onChangeField?.("recording_tag", tag)}
            {...props}
          />
        )}
      </input.Group>
    </div>
  );
}
