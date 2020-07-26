import * as React from "react";

/**
 * The shape of the modal context
 */
export type ModalConsumerContextType<P = {}> = {
  hideModal: () => void;
} & P;

/**
 * Throw error when ModalContext is used outside of context provider
 */
const invariantViolation = () => {
  throw new Error(
    "Attempted to call useModal outside of modal context. Make sure your app is rendered inside ModalProvider."
  );
};

/**
 * Modal Context Object
 */
export const ModalConsumerContext = React.createContext<ModalConsumerContextType>({
  hideModal: invariantViolation
});
