import { heartbeatDoc } from "@/lib/heartbeat-doc";

export function GET() {
  return new Response(heartbeatDoc, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
