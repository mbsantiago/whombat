import type { User } from "@/types";

export default function UserProfile(props: { user: User }) {
  const { user } = props;
  return <div>{user.username}</div>;
}
