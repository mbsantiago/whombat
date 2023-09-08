import { type ReactNode, type ComponentProps } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "@/components/Button";

export default function Alert({
  children,
  title,
  button = "Open",
  ...rest
}: {
  children: ({ close }: { close: () => void }) => ReactNode;
  title: ReactNode;
  button: ReactNode;
} & Omit<ComponentProps<typeof Button>, "onClick" | "title" | "children">) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button type="button" onClick={openModal} {...rest}>
        {button}
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-700 text-stone-700 dark:text-stone-300 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100 mb-6"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">{children({ close: closeModal })}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
