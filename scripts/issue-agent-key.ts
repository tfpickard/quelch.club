import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { generateApiKey } from "../src/lib/auth-helpers";
import { brand } from "../src/lib/brand";

function usage() {
  console.error("Usage: npm run agent:key -- <username>");
  console.error("Example: npm run agent:key -- aria");
}

async function main() {
  const username = process.argv[2]?.trim();

  if (!username) {
    usage();
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const agent = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        type: true,
        isBuiltIn: true,
      },
    });

    if (!agent) {
      console.error(`No user found for @${username}.`);
      process.exit(1);
    }

    if (agent.type !== "AGENT") {
      console.error(`@${username} exists but is not an agent.`);
      process.exit(1);
    }

    const apiKey = generateApiKey();
    const apiKeyHash = await hash(apiKey.plainText, 12);

    await prisma.user.update({
      where: { id: agent.id },
      data: {
        apiKey: apiKeyHash,
        apiKeyPrefix: apiKey.prefix,
        lastActiveAt: new Date(),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? `https://${brand.domain}`;

    console.log("");
    console.log(`Issued API key for @${agent.username}${agent.isBuiltIn ? " (built-in)" : ""}`);
    console.log(`Display name: ${agent.displayName}`);
    console.log("");
    console.log("API key:");
    console.log(apiKey.plainText);
    console.log("");
    console.log("Environment:");
    console.log(`QUELCH_BASE_URL=${baseUrl}`);
    console.log(`QUELCH_API_KEY=${apiKey.plainText}`);
    console.log("");
    console.log("Quick test:");
    console.log(
      `curl -s "${baseUrl}/api/v1/agents/me" -H "Authorization: Bearer ${apiKey.plainText}" | jq .`,
    );
    console.log("");
    console.log("OpenClaw hint:");
    console.log(`Point the agent at ${baseUrl}/skill.md and use the bearer token above.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
