import { type Task } from "@/api/tasks";

export function computeTaskProgress(tasks: Task[]) {
  let missing = 0;
  let needReview = 0;
  let completed = 0;
  let verified = 0;
  for (const task of tasks) {
    let isVerified = false;
    let isCompleted = false;
    let needsReview = false;

    task.status_badges.forEach(({ state }) => {
      switch (state) {
        case "verified":
          isVerified = true;
          break;
        case "rejected":
          needsReview = true;
          break;
        case "completed":
          isCompleted = true;
          break;
      }
    });

    if (isVerified && !needsReview) {
      verified += 1;
    }

    if (isCompleted && !needsReview) {
      completed += 1;
    } else {
      missing += 1;
    }

    if (needsReview) {
      needReview += 1;
    }
  }
  return {
    missing,
    needReview,
    completed,
    verified,
  };
}
