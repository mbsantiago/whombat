import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import Button from "@/lib/components/ui/Button";
import { CloseIcon } from "@/lib/components/icons";

import type { ComponentProps, ReactNode } from "react";

/**
 * A modal dialog component that provides a customizable overlay with a title,
 * content, and close button.
 */
export default function Dialog({
  title,
  children,
  label,
  open = false,
  width = "max-w-lg",
  ...rest
}: {
  /** The title of the dialog. */
  title?: ReactNode;
  /** The text or content of the button that triggers the opening of the dialog. */
  label: ReactNode;
  /** Controls the initial open state of the dialog. */
  open?: boolean;
  /** A class name to control the width of the dialog content area. */
  width?: string;
  /** A function that renders the content of the dialog. This function
   * receives a `close` function that can be used to programmatically close
   * the dialog. */
  children: ({ close }: { close: () => void }) => ReactNode;
} & Omit<ComponentProps<typeof Button>, "onClick" | "title" | "children">) {
  let [isOpen, setIsOpen] = useState(open);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...rest}>
        {label}
      </Button>
      <DialogOverlay
        title={<div>{title}</div>}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {({ close }) => <div className={width}>{children({ close })}</div>}
      </DialogOverlay>
    </>
  );
}

export function DialogOverlay({
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
                  className="flex flex-row gap-4 justify-between items-center mb-4"
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
