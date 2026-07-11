interface RiskListProps {
  risks: string[];
}

export function RiskList({ risks }: RiskListProps) {
  if (risks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No risks identified.</p>
    );
  }

  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
      {risks.map((risk, index) => (
        <li key={`${index}-${risk}`} className="break-words">
          {risk}
        </li>
      ))}
    </ul>
  );
}
