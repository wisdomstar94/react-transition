"use client"

import { Transition } from "@/components/transition/transition.component";
import { createRef, useState } from "react";
import styles from './page.module.css';
import { TestItem } from "@/components/test-item/test-item.component";

interface Item {
  timestamp: number;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>();

  function getRandomNumber(min: number, max: number): number {
    return Math.round(min + (Math.random() * (max - min)));
  }

  return (
    <>
      <div className="w-full relative block">
        <Transition
          className="w-full relative flex flex-wrap items-start content-start"
          childWrapperClassName="w-full relative"
          timeouts={{
            enter: 400,
            leave: 2000,
          }}
          classNames={{
            enterStartBefore: 'bg-blue-500',
            enter: styles['enter'],
            enterEndAfter: 'bg-amber-500',
            leaveStartBefore: 'bg-red-500',
            leave: styles['leave'],
          }}>
          {
            items?.map((item, index) => {
              return (
                <TestItem key={`${item.timestamp}`}>
                  { item.timestamp }
                  <button 
                    onClick={() => {
                      setItems(prev => prev?.filter(t => t.timestamp !== item.timestamp));
                    }}>
                    x
                  </button>
                </TestItem>
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
        <button
          onClick={() => {
            setItems(prev => {
              const newArr = [...(prev ?? [])];
              const randomIndex = getRandomNumber(0, newArr.length);
              newArr.splice(randomIndex, 0, { timestamp: Date.now() });
              return newArr;
            });
          }}>
          랜덤 위치에 아이템 추가하기
        </button>
      </div>
    </>
  );
}
