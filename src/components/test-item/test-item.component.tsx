import { ITestItem } from "./test-item.interface";

export function TestItem(props: ITestItem.Props) {
  const {
    children,
  } = props;

  return (
    <article className="inline-flex">
      { children }
    </article>
  )
}