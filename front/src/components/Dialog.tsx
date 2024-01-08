import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import Button from "@/components/Button";
import { CloseIcon } from "@/components/icons";

import type { ComponentProps, ReactNode } from "react";

export default function Dialog({
  title,
  children,
  label,
  open = false,
  ...rest
}: {
  title?: ReactNode;
  label: ReactNode;
  open?: boolean;
  children: ({ close }: { close: () => void }) => ReactNode;
} & Omit<ComponentProps<typeof Button>, "onClick" | "title" | "children">) {
  let [isOpen, setIsOpen] = useState(open);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...rest}>
        {label}
      </Button>
      <DialogOverlay
        title={<div className="max-w-md">{title}</div>}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {({ close }) => <div className="max-w-md">{children({ close })}</div>}
      </DialogOverlay>
    </>
  );
}

function DialogOverlay({
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
        className="relative z-50"
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
        <div className="overflow-y-auto fixed inset-0">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel className="overflow-hidden p-6 w-full text-left align-middle rounded-2xl shadow-xl transition-all transform max-w-fit bg-stone-50 text-stone-700 z-[99999] dark:bg-stone-700 dark:text-stone-300">
                <HeadlessDialog.Title
                  as="div"
                  className="mb-4 flex flex-row justify-between items-center gap-4"
                >
                  {title != null && (
                    <h3 className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100">
                      {title}
                    </h3>
                  )}
                  <Button
                    onClick={() => onClose?.()}
                    variant="secondary"
                    mode="text"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </Button>
                </HeadlessDialog.Title>
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
