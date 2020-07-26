import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import * as React from "react";
import { ModalContext, ModalType, ModalTypeExtract } from "./ModalContext";
import { ModalConsumerContext } from "./ModalConsumerContext";

/**
 * Callback types provided for descriptive type-hints
 */
type ShowModal = () => void;
type HideModal = () => void;

/**
 * Utility function to generate unique number per component instance
 */
const generateModalKey = (() => {
  let count = 0;

  return () => `${++count}`;
})();

/**
 * Check whether the argument is a stateless component.
 *
 * We take advantage of the stateless nature of functional components to be
 * inline the rendering of the modal component as part of another immutable
 * component.
 *
 * This is necessary for allowing the modal to update based on the inputs passed
 * as the second argument to useModal without unmounting the previous version of
 * the modal component.
 */
const isFunctionalComponent = (Component: Function) => {
  const prototype = Component.prototype;

  return !prototype || !prototype.isReactComponent;
};

/**
 * React hook for showing modal windows
 */
export const useModal = <M extends ModalType, P extends ModalTypeExtract<M>>(
  ModalComponent: M,
  props: P = {} as any
): [ShowModal, HideModal] => {
  if (!isFunctionalComponent(ModalComponent)) {
    throw new Error(
      "Only stateless components can be used as an argument to useModal. You have probably passed a class component where a function was expected."
    );
  }

  const key = useMemo(generateModalKey, []);
  const context = useContext(ModalContext);
  const showModal = useCallback(() => setShown(true), []);
  const hideModal = useCallback(() => setShown(false), []);
  const [isShown, setShown] = useState<boolean>(false);

  const modal = () => {
    const modalProps: any = { hideModal, ...props };
    const contextValue = useMemo(() => ({ hideModal }), []);

    return (
      <ModalConsumerContext.Provider value={contextValue}>
        <ModalComponent {...modalProps} />
      </ModalConsumerContext.Provider>
    );
  };

  useEffect(() => {
    if (isShown) {
      context.showModal(key, modal);
    } else {
      context.hideModal(key);
    }

    // Hide modal when parent component unmounts
    return () => context.hideModal(key);
  }, [modal, isShown]);

  return [showModal, hideModal];
};
