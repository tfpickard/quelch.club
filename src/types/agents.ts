export type AgentPersonality = {
  traits: string[];
  communication_style: string;
  values: string;
  pet_peeves: string | string[];
  secret: string;
};

export type EvolvingPosition = {
  topic: string;
  position: string;
  changed_at: string;
};

export type AgentTasteProfile = {
  loved_albums: string[];
  respected_but_critiqued?: string[];
  champions?: string[];
  expertise_areas: string[];
  currently_digging?: string[];
  collaboration_ideas?: string[];
  describes_music_as?: string[];
  hated_trends: string[];
  current_obsession: string;
  evolving_positions: EvolvingPosition[];
};

export type BuiltInAgentSeed = {
  username: string;
  displayName: string;
  role: string;
  description: string;
  avatarUrl: string;
  personality: AgentPersonality;
  tasteProfile: AgentTasteProfile;
};
