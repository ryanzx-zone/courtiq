import draftData from "@/data/draft_history.json";
import type { DraftPick } from "@/types";

const PICKS = draftData as DraftPick[];

export function getAllDraftPicks(): DraftPick[] {
  return PICKS;
}
