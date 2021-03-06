
/** A comma separated list of fields to expand. */
export type TweetExpansionsParameter = Query<Array<"author_id" | "referenced_tweets.id" | "in_reply_to_user_id" | "geo.place_id" | "attachments.media_keys" | "attachments.poll_ids" | "entities.mentions.username" | "referenced_tweets.id.author_id"> & MinimumElements<1> & UniqueElements, "expansions">;
