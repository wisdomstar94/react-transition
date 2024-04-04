"use client"

import { Transition } from "@/components/transition/transition.component";
import { useState } from "react";

export default function Page() {
  const [arr, setArr] = useState<number[]>([]);

  return (
    <>
      {
        arr.map(item => {
          return (
            <Transition 
              key={item}
              classNames={{
                enter: 'enter',
                leave: 'leave',
              }}
              timeouts={{
                enter: 300,
                leave: 300,
              }}>
              <div data-why="왜???" key={'azzz'}>...</div>
            </Transition>
          );
        })
      }
      <div className="w-full fixed bottom-0 left-0 z-50 bg-white">
        <button
          className="inline-flex flex-wrap text-xs text-slate-600 px-3 py-1.5 border border-slate-400 rounded-lg cursor-pointer hover:bg-slate-100"
          onClick={() => {
            console.log('?');
            setArr(prev => {
              const newArr = [...prev];
              newArr.push(Date.now());
              return newArr;
            });
          }}
          >
          아이템 추가
        </button>
      </div>
    </>
  );
}