import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { name } = SubredditValidator.parse(body);
    console.log("Name of subreddit going to create is ", name);
    // check if subreddit name is taken
    const isSubredditNameTaken = await db.subreddit.findFirst({
      where: { name }
    });

    console.log("Is subreddit name taken kya? ", isSubredditNameTaken);
    // if subreddit name is taken, return 409
    if (isSubredditNameTaken) {
      return new Response("Subreddit name is taken", { status: 409 });
    }

    console.log("Subreddit not taken so now pushing to db ", name);

    // create subreddit
    const subreddit = await db.subreddit.create({
      data: {
        name,
        userId: session.user.id
      }
    });

    console.log("Subreddit created ", name);

    // create subscription to subreddit
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id
      }
    });

    return new Response(subreddit.name, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    console.error(error);
    return new Response("Could not create subreddit", { status: 500 });
  }
}
