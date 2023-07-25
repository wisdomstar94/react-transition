import React, { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from './transition.module.css';
import { ITransition } from "./transition.interface";

const DATA_TRANSITION_ITEM_KEY = `data-transition-item-key` as const;

export function Transition(props: ITransition.ComponentProps) {
  const {
    className,
  } = props;

  const isMounted = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [backupedChilds, setBackupedChilds] = useState<React.ReactElement<any, string | React.JSXElementConstructor<any>>[]>();
  const backupedChildsRef = useRef<React.ReactElement<any, string | React.JSXElementConstructor<any>>[]>([]);

  const transitioningItems = useRef(new Map<string, NodeJS.Timeout>());

  const enterActiveClassName = useMemo(() => props.classNames?.enterActive ?? '.', [props.classNames?.enterActive]);
  const enterClassName = useMemo(() => props.classNames?.enter ?? styles['enter'], [props.classNames?.enter]);
  const enterDoneClassName = useMemo(() => props.classNames?.enterDone ?? '.', [props.classNames?.enterDone]);
  
  const exitActiveClassName = useMemo(() => props.classNames?.exitActive ?? '.', [props.classNames?.exitActive]);
  const exitClassName = useMemo(() => props.classNames?.exit ?? styles['exit'], [props.classNames?.exit]);
  const exitDoneClassName = useMemo(() => props.classNames?.exitDone ?? '.', [props.classNames?.exitDone]);

  const enterTimeout = useMemo(() => props.timeout?.enter ?? 500, [props.timeout?.enter]);
  const exitTimeout = useMemo(() => props.timeout?.exit ?? 500, [props.timeout?.exit]);

  const isDisableTransitionWhenFirstRender = useMemo(() => props.isDisableTransitionWhenFirstRender ?? true, [props.isDisableTransitionWhenFirstRender]);
  const isDisableTransition = useMemo(() => props.isDisableTransition ?? false, [props.isDisableTransition]);

  const enterActiveTargetSelectorsRef = useRef<string[]>([]);

  const getRealKey = useCallback((key: string) => {
    let realKey = key;
    if (key[0] === '.' && key[1] === '$') {
      realKey = key.substring(2);
    }
    return realKey;
  }, []);

  const subtractionArrays = useCallback(function<T>(a: T[], b: T[]) {
    const newArr: T[] = [];
    a.forEach((x) => {
      if (b.includes(x)) {
        return;
      }
      newArr.push(x);
    });
    return newArr;
  }, []);

  const setTransitioningItems = useCallback((key: string, t: NodeJS.Timeout) => {
    const originT = transitioningItems.current.get(key);
    if (originT !== undefined) {
      clearTimeout(originT);
    }
    transitioningItems.current.delete(key);
    transitioningItems.current.set(key, t);
  }, []);

  const mergeArrays = useCallback((source: any[], target: any[]) => {
    if (source.length === target.length && source.every(x => target.includes(x))) {
      return target;
    }

    if (source.every(x => target.includes(x))) {
      return target;
    }

    const result = [ ...source ];

    let basket: any[] = [];
    for (let i = 0; i < target.length; i++) {
      const current = target[i];
      if (result.includes(current)) continue;

      basket.push(current);
      const prev = target[i - 1];
      const next = target[i + 1];

      if (result.includes(prev)) {
        const index = result.findIndex(value => value === prev);
        result.splice(index + 1, 0, ...basket);
        basket = [];
      } else if (result.includes(next)) {
        const index = result.findIndex(value => value === next);
        result.splice(index - 1, 0, ...basket);
        basket = [];
      } 

      if (basket.length > 0 && i === target.length - 1) {
        result.unshift(...basket);
      }
    }

    return result;
  }, []);

  const disposeClassList = useCallback((element: HTMLElement | undefined | null, className: string, type: 'add' | 'remove') => {
    if (element === undefined) return;
    if (element === null) return;

    const classNames = className.split(' ').filter(x => x.trim() !== '' && x !== '.');
    classNames.forEach((_className) => {
      if (type === 'add') {
        element.classList.add(_className);
      } else {
        element.classList.remove(_className);
      }
    });
  }, []);

  const isClassContains = useCallback((element: HTMLElement | undefined | null, className: string) => {
    if (element === undefined) return false;
    if (element === null) return false;
    const classNames = className.split(' ').filter(x => x.trim() !== '');
    return classNames.some(x => element.classList.contains(x));
  }, []);

  useEffect(() => {
    if (props.children === undefined) return;
    const realExistKeys: string[] = [];
    const realChilds: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined = [];
    Children.forEach(props.children, (child) => {
      realChilds.push(child as any);
      const key = getRealKey((child as any).key as string);
      realExistKeys.push(key);
    });

    const backupedKeys: string[] = [];
    backupedChilds?.forEach((child) => {
      const key = getRealKey((child as any).key as string);
      backupedKeys.push(key);
    });

    // 추가가 되어야 할 요소들의 키를 추려냅니다.
    const enterTargetKeys = subtractionArrays(realExistKeys, backupedKeys);

    // 삭제가 되어야 할 요소들의 키를 추려냅니다.
    const exitTargetKeys = subtractionArrays(backupedKeys, realExistKeys);

    enterActiveTargetSelectorsRef.current = [];
    // const enterActiveTargetSelectors: string[] = [];
    {
      // 갱신할 백업된 요소들의 목록을 저장할 변수를 선언합니다.
      const newBackupedChilds: any[] = [];

      const merge = mergeArrays(backupedKeys ?? [], realExistKeys ?? []);
      merge.forEach((key) => {
        // 실제 자식 요소의 key 를 가져옵니다.
        const realChild = realChilds.find(x => getRealKey(x.key as string) === getRealKey(key));
        const backupChild = backupedChilds?.find(x => getRealKey(x.key as string) === getRealKey(key));
        const child = realChild ?? backupChild;
        
        if (child === undefined) return;

        newBackupedChilds.push(child);
        const selector: string = `[${DATA_TRANSITION_ITEM_KEY}='${key}']`;
        const getElement = () => {
          return containerRef.current?.querySelector<HTMLElement>(selector);
        };

        // 해당 요소의 key 가 백업된 요소들의 key 목록에 포함되어 있는지 체크합니다. (즉, 화면에 이미 그려진 상태인지 체크합니다.)
        if (backupedKeys.includes(key)) {
          // 해당 요소가 transition 중인지 체크합니다.
          if (transitioningItems.current.get(key) !== undefined) {
            // 해당 요소가 화면에 그려져 있는 상태이고 transition 중 (추가중 or 삭제중) 인 상태에서 다시 add 이벤트가 발생한 경우입니다. 
            // 해당 요소가 삭제중이었는지 체크합니다.
            if (isClassContains(getElement(), exitClassName)) {
              // 삭제중이었는데 다시 추가 이벤트가 발생한 경우이므로, exitClassName 클래스를 제거하고 enterClassName 클래스를 추가합니다. 그리고 setTimeout 도 재설정합니다.
              disposeClassList(getElement(), exitActiveClassName, 'remove');
              disposeClassList(getElement(), exitClassName, 'remove');
              disposeClassList(getElement(), enterClassName, 'add');
              disposeClassList(getElement(), enterActiveClassName, 'add');
              setTransitioningItems(key, setTimeout(() => {
                transitioningItems.current.delete(key);
                disposeClassList(getElement(), enterDoneClassName, 'add');
                disposeClassList(getElement(), enterActiveClassName, 'remove');
              }, enterTimeout));
            } 
          } 
          // newBackupedChilds.push(child);
          return;
        }

        // 해당 요소의 key 가 추가가 되어야 할 요소들의 key 목록에 포함되어 있는지 체크합니다. 
        if (enterTargetKeys.includes(key)) {
          // newBackupedChilds.push(child);
          // 해당 요소가 transition 중인지 체크합니다. (즉, enter 트랜지션 중인지 체크합니다.)
          const timeout = transitioningItems.current.get(key);
          if (timeout !== undefined) {
            // 트랜지션 중
            clearTimeout(timeout);
          } else {
            // 트랜지션 중 아님
            disposeClassList(getElement(), enterClassName, 'add');
            disposeClassList(getElement(), enterDoneClassName, 'add');
          }
            
          enterActiveTargetSelectorsRef.current.push(selector);

          // transition timeout 을 설정합니다.
          setTransitioningItems(key, setTimeout(() => {
            transitioningItems.current.delete(key);
            disposeClassList(getElement(), enterDoneClassName, 'add');
            disposeClassList(getElement(), enterActiveClassName, 'remove');
          }, enterTimeout));
          return;
        }
      });

      backupedChildsRef.current = newBackupedChilds;
      setBackupedChilds(newBackupedChilds);
    } 
    
    {
      // 삭제가 되어야 할 요소들을 하나씩 돕니다.
      for (const exitTargetKey of exitTargetKeys) {
        // 삭제가 되어야 할 요소입니다.
        const element = containerRef.current?.querySelector<HTMLElement>(`[${DATA_TRANSITION_ITEM_KEY}='${exitTargetKey}']`);
        // enterClassName 을 삭제합니다.
        disposeClassList(element, enterClassName, 'remove');

        // exitActiveClassName 을 추가합니다.
        disposeClassList(element, exitActiveClassName, 'add');
        // exitClassName 을 추가합니다.
        disposeClassList(element, exitClassName, 'add');

        // exit 에 해당하는 timeout 을 걸어줍니다.
        setTransitioningItems(exitTargetKey, setTimeout(() => {
            // 갱신할 백업된 요소들의 목록을 저장할 변수를 선언합니다.
          const newBackupedChilds: any[] = [];

          // 현재 백업되어 있는 요소들을 하나씩 돕니다.
          backupedChildsRef.current?.forEach((child) => {
            // 현재 차례의 백업된 요소의 key 를 가져옵니다.
            const key = getRealKey((child as any).key as string).toString();
            // 해당 key 가 삭제되어야 할 요소의 key 인지 체크합니다.
            if (key === exitTargetKey) {
              return;
            }
            // 해당 key 가 삭제되어야 할 요소의 key 가 아닌 경우에는 갱신할 백업된 요소들의 목록에 추가합니다.
            newBackupedChilds.push(child);
          });

          // transitioningItems 에서 삭제 되어야할 요소의 key 를 제거합니다.
          transitioningItems.current.delete(exitTargetKey);

          // 백업된 요소들의 목록을 갱신합니다.
          backupedChildsRef.current = newBackupedChilds;
          setBackupedChilds(newBackupedChilds);
        }, exitTimeout));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.children]);

  useEffect(() => {
    const childs = Children.map(props.children, (child, index) => {
      const key = getRealKey((child as any).key as string);
      return child;
    }) ?? [];
    backupedChildsRef.current = childs as any;
    setBackupedChilds(childs as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (backupedChilds === undefined) return;
    if (backupedChilds.length === 0) return;
    backupedChilds.forEach((child, index) => {
      const key = getRealKey(child.key as string);
      const element = ((child as any).ref.current as HTMLElement);
      element?.setAttribute(DATA_TRANSITION_ITEM_KEY, key);
      
      if (!isMounted.current) {
        if (!isDisableTransition) {
          // disposeClassList(element, enterActiveClassName, 'add');
          disposeClassList(element, enterClassName, 'add');
          setTransitioningItems(key, setTimeout(() => {
            transitioningItems.current.delete(key);
            disposeClassList(element, enterDoneClassName, 'add');
          }, enterTimeout));
        } 
      } else if (isClassContains(element, exitClassName)) { // 현재 차례의 백업된 요소가 삭제되고 있는 중인지 체크합니다.

      } else if (!transitioningItems.current.has(key)) { // 현재 차례의 백업된 요소가 이미 완전히 그려진 상태인지 체크합니다.
        disposeClassList(element, enterDoneClassName, 'add');
      } else if (transitioningItems.current.has(key)) { // 현재 차례의 백업된 요소가 그려지고 있는 중인지 체크합니다.
        if (!isDisableTransitionWhenFirstRender && !isDisableTransition) {
          disposeClassList(element, enterClassName, 'add');
        } else if (!isDisableTransition) {
          // disposeClassList(element, enterActiveClassName, 'add');
          disposeClassList(element, enterClassName, 'add');
        }  
      } 
    });
    enterActiveTargetSelectorsRef.current.forEach((selector) => {
      const element = containerRef.current?.querySelector<HTMLElement>(selector);
      disposeClassList(element, enterActiveClassName, 'add');
    });
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backupedChilds]);

  return (
    <>
      <div 
        className={className} 
        ref={containerRef}
        >
        {
          backupedChilds?.map((child) => {
            return child;
          })
        }
      </div>
    </>
  );
}