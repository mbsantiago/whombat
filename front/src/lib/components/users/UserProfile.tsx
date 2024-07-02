import type { User } from "@/lib/types";
import Dialog from "@/components/Dialog";
import { Input } from "@/components/inputs";
import { UserIcon } from "@/components/icons";
import {
  DescriptionTerm,
  EditableDescriptionData,
} from "@/components/Description";
import UserChangePassword from "@/components/users/UserChangePassword";
import useActiveUser from "@/lib/hooks/api/useActiveUser";

export default function UserProfile(props: { user: User }) {
  const { user } = props;

  const {
    update: { mutate: updateUser },
  } = useActiveUser();

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 sm:px-0 inline-flex items-end">
        <UserIcon className="w-12 h-12 text-stone-500" />
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          Your Profile
        </h3>
      </div>
      <p className="text-stone-500">
        Manage your public profile information here. Please note that this
        information is visible to other users. Your username is used for
        authentication, so ensure it&apos;s memorable.
      </p>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Username</DescriptionTerm>
            <EditableDescriptionData
              value={user.username}
              onChange={(username) => updateUser({ username })}
              Input={Input}
              autoFocus
            >
              {user.username}
            </EditableDescriptionData>
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={user.name}
              onChange={(name) => updateUser({ name: name as string })}
              Input={Input}
              autoFocus
            >
              {user.name}
            </EditableDescriptionData>
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Email</DescriptionTerm>
            <EditableDescriptionData
              value={user.email}
              onChange={(email) => updateUser({ email: email })}
              Input={Input}
              autoFocus
            >
              {user.email}
            </EditableDescriptionData>
          </div>
        </dl>
        <Dialog mode="text" title="Change Password" label={"Change password"}>
          {() => <UserChangePassword user={user} />}
        </Dialog>
      </div>
    </div>
  );
}
