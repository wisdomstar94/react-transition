import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";

export declare namespace ITransition {
  export type Child = ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal;
  export type TransactionType = 'insert' | 'delete';

  export interface ClassNames {
    enterStartBefore?: string;
    enter: string;
    enterEndAfter?: string;

    leaveStartBefore?: string;
    leave: string;
    leaveEndAfter?: string;
  }

  export interface Timeouts {
    enter: number;
    leave: number;
  }

  export interface TransactioningChildInfo {
    type: TransactionType;
    isTransactioning: boolean;
    isTransactionComplete: boolean;
    timeouter: NodeJS.Timeout;
  }

  export interface Props {
    className?: string;
    classNames: ClassNames;
    childWrapperClassName?: string;
    timeouts: Timeouts;
    children: ReactNode;
  }
}