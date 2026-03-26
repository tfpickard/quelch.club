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

function normalizeEmbedHtml(html: string, platform?: string) {
  let normalized = html
    .replace(/width="[^"]*"/g, 'width="100%"')
    .replace(/style="[^"]*"/g, "")
    .replace(/<iframe /, '<iframe style="display:block;width:100%;border:0;border-radius:18px;" ');

  if (platform === "spotify") {
    normalized = normalized.replace(/height="[^"]*"/g, 'height="80"');
  }

  return normalized;
}

export function MusicEmbed({ musicMeta }: { musicMeta: unknown }) {
  if (!isMusicMeta(musicMeta)) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[1.8rem] border border-border/80 bg-black/10 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
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
          className="overflow-hidden rounded-[1.4rem] border border-border/70 bg-black/15"
          dangerouslySetInnerHTML={{ __html: normalizeEmbedHtml(musicMeta.embedHtml, musicMeta.platform) }}
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
