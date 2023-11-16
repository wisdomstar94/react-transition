import { Children, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ITransition } from "./transition.interface";

function getKey(key: string) {
  return key.replace('.$', '');
}

export function Transition(props: ITransition.Props) {
  const {
    className,
    childWrapperClassName,
    children,
  } = props;

  const childWrapperElements = useRef<Record<string, HTMLDivElement | null>>({});
  
  const classNames = useMemo<ITransition.ClassNames>(() => ({
    enterStartBefore: props.classNames.enterStartBefore,
    enter: props.classNames.enter,
    enterEndAfter: props.classNames.enterEndAfter,
    leaveStartBefore: props.classNames.leaveStartBefore,
    leave: props.classNames.leave,
  }), [props.classNames.enter, props.classNames.enterEndAfter, props.classNames.enterStartBefore, props.classNames.leave, props.classNames.leaveStartBefore]);

  const timeouts = useMemo<ITransition.Timeouts>(() => ({
    enter: props.timeouts.enter,
    leave: props.timeouts.leave,
  }), [props.timeouts.enter, props.timeouts.leave]);
  
  const takingChildren = useRef<ITransition.Child[]>([]);
  const transactioningChildren = useRef<Record<string, ITransition.TransactioningChildInfo | undefined>>({});
  const [renderedChildren, setRenderedChildren] = useState<ITransition.Child[]>([]);

  // 새로 들어온 child 확인 및 처리
  useLayoutEffect(() => {
    Children.forEach(children, (child, index) => {
      const key: string = getKey((child as any).key);
      const target = takingChildren.current.find(renderedChild => {
        const renderedChildKey: string = getKey((renderedChild as any).key);
        return renderedChildKey === key;
      });
      if (target === undefined) {
        clearTimeout(transactioningChildren.current[key]?.timeouter);
        transactioningChildren.current[key] = {
          type: 'insert',
          isTransactioning: true,
          isTransactionComplete: false,
          timeouter: setTimeout(() => {
            if (transactioningChildren.current[key] !== undefined) {
              transactioningChildren.current[key]!.isTransactionComplete = true;
            }
            setRenderedChildren(prev => [...prev]);
          }, timeouts.enter),
        };
        setRenderedChildren(prev => {
          const newArr = [...prev];
          newArr.splice(index, 0, child as any);
          return newArr;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  // 삭제 된 child 확인 및 처리
  useLayoutEffect(() => {
    takingChildren.current.forEach((child, index) => {
      const key: string = getKey((child as any).key);
      const target = Children.toArray(children).find(_child => {
        const _childKey: string = getKey((_child as any).key);
        return _childKey === key;
      });
      if (target === undefined) {
        clearTimeout(transactioningChildren.current[key]?.timeouter);
        transactioningChildren.current[key] = {
          type: 'delete',
          isTransactioning: true,
          isTransactionComplete: false,
          timeouter: setTimeout(() => {
            delete transactioningChildren.current[key];
            takingChildren.current.splice(takingChildren.current.findIndex(k => getKey((k as any).key) === key), 1);
            setRenderedChildren(prev => {
              const newArr = [...prev];
              newArr.splice(newArr.findIndex(k => getKey((k as any).key) === key), 1);
              return newArr;
            });
          }, timeouts.leave),
        };
        setRenderedChildren(prev => [...prev]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useLayoutEffect(() => {
    takingChildren.current = [...renderedChildren];
  }, [renderedChildren]);

  return (
    <>
      <div className={className}>
        {
          renderedChildren.map((child, index) => {
            const key: string = getKey((child as any).key);
            return (
              <div  
                data-title="child-wrapper-element"
                ref={(el) => {childWrapperElements.current[key] = el}}
                className={[
                  childWrapperClassName, 

                  transactioningChildren.current[key]?.type === 'insert' && transactioningChildren.current[key]?.isTransactionComplete === false ? classNames.enterStartBefore : '',
                  transactioningChildren.current[key]?.type === 'insert' ? classNames.enter : '',
                  transactioningChildren.current[key]?.type === 'insert' && transactioningChildren.current[key]?.isTransactionComplete === true ? classNames.enterEndAfter : '',

                  transactioningChildren.current[key]?.type === 'delete' ? classNames.leaveStartBefore : '',
                  transactioningChildren.current[key]?.type === 'delete' ? classNames.leave : '',
                ].join(' ')}
                key={key}>
                { child }
              </div>
            );
          })
        }
      </div>
    </>
  );
}
