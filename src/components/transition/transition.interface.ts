export declare namespace ITransition {
  export interface ClassNames {
    enterActive?: string;
    enter: string;
    enterDone?: string;

    exitActive?: string;
    exit: string;
    exitDone?: string;
  }

  export interface Timeout {
    enter: number;
    exit: number;
  }

  export interface ComponentProps {
    className?: string;
    children: React.ReactNode;
    classNames?: ClassNames;
    timeout?: Timeout;
    /**
     * 첫 렌더링시에는 트랜지션을 적용하지 않을 것인지에 대한 값입니다.
     */
    isDisableTransitionWhenFirstRender?: boolean;
    /**
     * 항상 트랜지션을 적용하지 않을 것인지에 대한 값입니다.
     */
    isDisableTransition?: boolean;
  }
}