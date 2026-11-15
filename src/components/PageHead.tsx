/** Shared page header: mono kicker, big thin serif title with one italic word, optional right-hand slot. */
export function PageHead({ kicker, title, italic = true, aside }: { kicker: string; title: string; italic?: boolean; aside?: React.ReactNode }) {
  const i = title.lastIndexOf(" ");
  return (
    <header className="pagehead">
      <div>
        <div className="label bronze">{kicker}</div>
        <h1>{italic && i > 0 ? <>{title.slice(0, i + 1)}<i>{title.slice(i + 1)}</i></> : title}</h1>
      </div>
      {aside}
    </header>
  );
}
