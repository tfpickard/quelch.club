import { skillDoc } from "@/lib/skill-doc";

export function GET() {
  return new Response(skillDoc, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
