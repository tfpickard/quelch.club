import { truncate } from "@/lib/utils";

export type MusicMeta = {
  platform: "spotify" | "youtube" | "soundcloud" | "bandcamp";
  url: string;
  title: string;
  artist: string | null;
  album: string | null;
  albumArtUrl: string | null;
  embedHtml: string | null;
  previewUrl: string | null;
};

type SpotifyToken = {
  accessToken: string;
  expiresAt: number;
};

let spotifyTokenCache: SpotifyToken | null = null;

function parseSpotifyUrl(input: string) {
  const match = input.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (!match) {
    return null;
  }

  return { kind: match[1], id: match[2] };
}

async function getSpotifyToken() {
  if (
    spotifyTokenCache &&
    spotifyTokenCache.expiresAt > Date.now() + 30_000
  ) {
    return spotifyTokenCache.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  spotifyTokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return json.access_token;
}

async function resolveSpotify(url: string): Promise<MusicMeta | null> {
  const parsed = parseSpotifyUrl(url);
  const token = await getSpotifyToken();

  if (!parsed || !token) {
    return null;
  }

  const response = await fetch(`https://api.spotify.com/v1/${parsed.kind}s/${parsed.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as Record<string, unknown>;
  const title = String(json.name ?? "Untitled");
  const artists = Array.isArray(json.artists)
    ? json.artists
        .map((artist) => (artist && typeof artist === "object" ? String((artist as { name?: string }).name ?? "") : ""))
        .filter(Boolean)
        .join(", ")
    : null;
  const album = typeof json.album === "object" && json.album
    ? String((json.album as { name?: string }).name ?? "")
    : parsed.kind === "album"
      ? title
      : null;
  const albumArtUrl =
    (typeof json.album === "object" &&
      json.album &&
      Array.isArray((json.album as { images?: Array<{ url: string }> }).images) &&
      (json.album as { images: Array<{ url: string }> }).images[0]?.url) ||
    (Array.isArray(json.images) ? String((json.images[0] as { url?: string })?.url ?? "") : null);
  const previewUrl = typeof json.preview_url === "string" ? json.preview_url : null;

  return {
    platform: "spotify",
    url,
    title,
    artist: artists,
    album,
    albumArtUrl,
    embedHtml: `<iframe src="https://open.spotify.com/embed/${parsed.kind}/${parsed.id}" width="100%" height="152" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
    previewUrl,
  };
}

async function resolveYouTube(url: string): Promise<MusicMeta | null> {
  if (!/(youtube\.com|youtu\.be)/.test(url)) {
    return null;
  }

  const response = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    title: string;
    author_name: string;
    html: string;
    thumbnail_url?: string;
  };

  return {
    platform: "youtube",
    url,
    title: json.title,
    artist: json.author_name,
    album: null,
    albumArtUrl: json.thumbnail_url ?? null,
    embedHtml: json.html,
    previewUrl: null,
  };
}

async function resolveSoundCloud(url: string): Promise<MusicMeta | null> {
  if (!url.includes("soundcloud.com")) {
    return null;
  }

  const response = await fetch(
    `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    title: string;
    author_name: string;
    html: string;
    thumbnail_url?: string;
  };

  return {
    platform: "soundcloud",
    url,
    title: json.title,
    artist: json.author_name,
    album: null,
    albumArtUrl: json.thumbnail_url ?? null,
    embedHtml: json.html,
    previewUrl: null,
  };
}

async function resolveBandcamp(url: string): Promise<MusicMeta | null> {
  if (!url.includes("bandcamp.com")) {
    return null;
  }

  const parsed = new URL(url);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const title = segments.at(-1)?.replace(/-/g, " ") ?? parsed.hostname.replace(".bandcamp.com", "");
  const artist = parsed.hostname.replace(".bandcamp.com", "");

  return {
    platform: "bandcamp",
    url,
    title: truncate(title, 80),
    artist,
    album: segments.includes("album") ? truncate(title, 80) : null,
    albumArtUrl: null,
    embedHtml: null,
    previewUrl: null,
  };
}

export async function resolveMusic(url: string): Promise<MusicMeta | null> {
  try {
    return (
      (await resolveSpotify(url)) ??
      (await resolveYouTube(url)) ??
      (await resolveSoundCloud(url)) ??
      (await resolveBandcamp(url))
    );
  } catch {
    return null;
  }
}
