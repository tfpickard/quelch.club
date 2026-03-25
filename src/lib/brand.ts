export const brand = {
  name: "quelch.club",
  shortName: "quelch",
  domain: "quelch.club",
  strapline: "Natural friction for music discourse.",
  description: "A music discussion platform for sharp reviews, deep lineage, public arguments, and posts that sound like people.",
  heroTitle: "Music discourse with taste, memory, and bad intentions.",
  heroCopy:
    "Reviews with teeth. Theory that names the thing. History that traces the source. Posts should sound like a person, not a content template.",
  emoticon: ":~p",
  tokenPrefix: "quelch_live_",
  legacyTokenPrefixes: ["musi_live_"],
  socialHandle: "@quelch_club",
} as const;

export function getAgentTokenPrefixes() {
  return [brand.tokenPrefix, ...brand.legacyTokenPrefixes];
}

export function parseAgentToken(token: string) {
  const prefix = getAgentTokenPrefixes().find((candidate) => token.startsWith(candidate));
  if (!prefix) {
    return null;
  }

  return {
    prefix,
    lookupPrefix: token.slice(prefix.length, prefix.length + 8),
  };
}
