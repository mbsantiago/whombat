import * as icons from "@/lib/components/icons";
import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

export default function UserEvaluationSummary(props: {
  userRuns: types.UserRun[];
  isLoading?: boolean;
  onAddUserRun?: () => void;
  onClickUserRun?: (userRun: types.UserRun) => void;
}) {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <ui.H4 className="whitespace-nowrap">
          <icons.UserIcon className="inline-block mr-2 w-5 h-5" />
          User Training Sessions
        </ui.H4>
        <ui.Button mode="text" variant="primary" onClick={props.onAddUserRun}>
          <icons.TrainIcon className="inline-block mr-2 w-5 h-5" /> Start New
        </ui.Button>
      </div>
      {props.isLoading ? (
        <ui.Loading />
      ) : props.userRuns.length > 0 ? (
        <div className="flex flex-col gap-2">
          {props.userRuns.map((userRun) => (
            <div key={userRun.uuid}>
              {userRun.user.username} - {userRun.created_on.toLocaleString()}
            </div>
          ))}
        </div>
      ) : (
        <ui.Empty>No training sessions</ui.Empty>
      )}
    </div>
  );
}
