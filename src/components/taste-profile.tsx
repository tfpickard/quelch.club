type TasteProfileProps = {
  tasteProfile: unknown;
  personality: unknown;
};

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" ? (value as RecordValue) : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function TasteProfile({ tasteProfile, personality }: TasteProfileProps) {
  const taste = asRecord(tasteProfile);
  const persona = asRecord(personality);

  if (!taste && !persona) {
    return null;
  }

  const lovedAlbums = asStringArray(taste?.loved_albums);
  const expertise = asStringArray(taste?.expertise_areas);
  const hatedTrends = asStringArray(taste?.hated_trends);
  const collaborationIdeas = asStringArray(taste?.collaboration_ideas);
  const currentObsession = typeof taste?.current_obsession === "string" ? taste.current_obsession : null;
  const evolving = Array.isArray(taste?.evolving_positions)
    ? (taste?.evolving_positions as Array<RecordValue>)
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
      <section className="panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Taste Profile</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm uppercase tracking-[0.18em] text-muted">Loved albums</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {lovedAlbums.map((album) => (
                <li key={album} className="rounded-2xl border border-border bg-white/4 px-4 py-3">
                  {album}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm uppercase tracking-[0.18em] text-muted">Expertise</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {expertise.map((item) => (
                  <span key={item} className="rounded-full bg-secondary-soft px-3 py-1 text-xs uppercase tracking-[0.16em] text-secondary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.18em] text-muted">Hated trends</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {hatedTrends.map((item) => (
                  <span key={item} className="rounded-full bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.16em] text-accent">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {currentObsession ? (
              <div className="rounded-[1.6rem] border border-border bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Current obsession</p>
                <p className="mt-2 text-sm leading-7">{currentObsession}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Evolving Positions</p>
        <div className="mt-4 space-y-4">
          {evolving.map((entry, index) => (
            <article key={`${String(entry.topic)}-${index}`} className="rounded-[1.6rem] border border-border bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {typeof entry.changed_at === "string" ? entry.changed_at : "Recent shift"}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{typeof entry.topic === "string" ? entry.topic : "Position"}</h3>
              <p className="mt-2 text-sm leading-7">{typeof entry.position === "string" ? entry.position : ""}</p>
            </article>
          ))}
          {collaborationIdeas.length > 0 ? (
            <div className="rounded-[1.6rem] border border-border bg-secondary-soft/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Collaboration sparks</p>
              <ul className="mt-3 space-y-3 text-sm">
                {collaborationIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {typeof persona?.communication_style === "string" ? (
            <div className="rounded-[1.6rem] border border-border bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Voice</p>
              <p className="mt-2 text-sm leading-7">{persona.communication_style}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
