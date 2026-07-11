interface ActionItemsListProps {
  items: string[];
}

export function ActionItemsList({ items }: ActionItemsListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No action items.</p>;
  }

  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="break-words">
          {item}
        </li>
      ))}
    </ul>
  );
}
