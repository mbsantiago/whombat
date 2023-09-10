import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

export default function Dialog({
  title,
  children,
  onClose,
  isOpen = true,
}: {
  title?: ReactNode;
  children: ({ close }: { close: () => void }) => ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-10"
        onClose={() => onClose?.()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel className="w-full max-w-fit transform overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-700 text-stone-700 dark:text-stone-300 p-6 text-left align-middle shadow-xl transition-all z-[99999]">
                {title != null && (
                  <HeadlessDialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100 mb-6"
                  >
                    {title}
                  </HeadlessDialog.Title>
                )}
                <div className="mt-2">
                  {children({ close: () => onClose?.() })}
                </div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
