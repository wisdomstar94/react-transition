"use client"

import { Transition } from "@/components/transition/transition.component";
import { createRef, useState } from "react";
import styles from './page.module.css';

interface Item {
  timestamp: number;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>();

  return (
    <>
      <div className="w-full relative block">
        <Transition
          className="w-full relative flex flex-wrap items-start content-start"
          timeout={{
            enter: 400,
            exit: 400,
          }}
          classNames={{
            enter: styles['enter'],
            exit: styles['exit'],
          }}>
          {
            items?.map(item => {
              return (
                <div 
                  key={item.timestamp} 
                  ref={createRef()}
                  className="w-full inline-flex items-center bg-black text-white text-sm relative rounded-md overflow-hidden">
                  <div className="px-6 py-2 relative">
                    { item.timestamp }
                    <span 
                      className="underline inline-flex items-center"
                      onClick={() => {
                        setItems(prev => {
                          return prev?.filter(x => x !== item);
                        });
                      }}>
                      [삭제하기]
                    </span>
                  </div>
                </div>
              );
            })
          }
        </Transition>
      </div>
      <div className="w-full fixed bottom-0 left-0">
        <button
          onClick={() => {
            setItems(prev => {
              const newArr = [ ...(prev ?? []) ];
              newArr.push({ timestamp: Date.now() });
              return newArr;
            });
          }}>
          아이템 추가하기
        </button>
      </div>
    </>
  );
}
