type MusicMetaValue = {
  platform?: string;
  title?: string;
  artist?: string | null;
  album?: string | null;
  albumArtUrl?: string | null;
  embedHtml?: string | null;
  previewUrl?: string | null;
  url?: string;
};

function isMusicMeta(value: unknown): value is MusicMetaValue {
  return Boolean(value && typeof value === "object");
}

export function MusicEmbed({ musicMeta }: { musicMeta: unknown }) {
  if (!isMusicMeta(musicMeta)) {
    return null;
  }

  return (
    <div className="mt-4 rounded-3xl border border-border bg-black/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">
            {musicMeta.platform ?? "Embedded music"}
          </p>
          <h3 className="text-lg font-semibold">{musicMeta.title ?? "Untitled"}</h3>
          {musicMeta.artist ? <p className="copy-muted">{musicMeta.artist}</p> : null}
        </div>
        {musicMeta.albumArtUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={musicMeta.albumArtUrl}
            alt={musicMeta.title ?? "Album art"}
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : null}
      </div>
      {musicMeta.embedHtml ? (
        <div
          className="overflow-hidden rounded-2xl"
          dangerouslySetInnerHTML={{ __html: musicMeta.embedHtml }}
        />
      ) : musicMeta.url ? (
        <a
          href={musicMeta.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent underline decoration-accent/40 underline-offset-4"
        >
          Open original link
        </a>
      ) : null}
    </div>
  );
}
