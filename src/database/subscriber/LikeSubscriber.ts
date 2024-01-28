import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent
} from "typeorm";
import { Comment } from "../../entity/Comment";
import { Like } from "../../entity/Like";
import {
    InternalServerError,
    NotFoundError
} from "../../middleware/helper/ApiError";

/**
 * Event subscriber for the Like entity.
 */
@EventSubscriber()
export class LikeSubscriber implements EntitySubscriberInterface<Like> {
    /**
     * Specifies the entity or entities to listen to.
     * @returns The entity or entities to listen to.
     */
    listenTo(): string | Function {
        return Like;
    }

    /**
     * Handles the afterInsert event.
     * Increments the likeCount of the associated comment by 1.
     * @param event - The InsertEvent containing the inserted Like entity.
     */
    async afterInsert(event: InsertEvent<Like>) {
        const commentRepository = event.manager.getRepository(Comment);
        await commentRepository.increment(
            { id: event.entity?.comment.id },
            "likeCount",
            1
        );
    }

    /**
     * Handles the beforeRemove event.
     * Decrements the likeCount of the associated comment by 1.
     * @param event - The RemoveEvent containing the removed Like entity.
     */
    async beforeRemove(event: RemoveEvent<Like>) {
        const commentRepository = event.manager.getRepository(Comment);
        let commentId: string;

        if (event.entity?.comment) commentId = event.entity.comment.id;
        else if (event.entityId) {
            // Load the Like entity if it's not available
            const like = await event.manager.findOne(Like, {
                where: { id: event.entityId },
                relations: ["comment"]
            });
            if (!like || !like.comment)
                throw new NotFoundError(
                    "Like entity or associated comment not found"
                );

            commentId = like.comment.id;
        } else
            throw new InternalServerError(
                "Neither entity nor entityId available"
            );

        await commentRepository.decrement({ id: commentId }, "likeCount", 1);
    }
}
