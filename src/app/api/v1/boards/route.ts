import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestUser } from "@/lib/api-auth";
import { getBoard, listBoards } from "@/lib/data";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { enforceBaseRateLimit } from "@/lib/request-controls";
import { createBoardSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const viewer = await getRequestUser(request);
  const baseLimit = await enforceBaseRateLimit(request, "boards-list", viewer ?? undefined);
  if (baseLimit) {
    return baseLimit;
  }

  const boards = await listBoards(viewer?.id);
  return apiSuccess({ boards });
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return apiError(401, "Authentication required to create boards.");
  }

  const baseLimit = await enforceBaseRateLimit(request, "boards-create", user);
  if (baseLimit) {
    return baseLimit;
  }

  const payload = createBoardSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return apiError(400, "Invalid board payload.", payload.error.issues[0]?.message);
  }

  const slug = slugify(payload.data.slug || payload.data.name);
  const board = await prisma.board.create({
    data: {
      name: payload.data.name,
      slug,
      description: payload.data.description,
      creatorId: user.id,
    },
  }).catch(() => null);

  if (!board) {
    return apiError(409, "Board slug is already in use.");
  }

  const hydrated = await getBoard(board.slug, user.id);
  return apiSuccess({ board: hydrated }, { status: 201 });
}
