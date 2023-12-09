import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent
} from "typeorm";
import { Comment } from "../../entity/Comment";
import { Like } from "../../entity/Like";

@EventSubscriber()
export class LikeSubscriber implements EntitySubscriberInterface<Like> {
    listenTo(): string | Function {
        return Like;
    }

    async afterInsert(event: InsertEvent<Like>) {
        const commentRepository = event.manager.getRepository(Comment);
        await commentRepository.increment(
            { id: event.entity?.comment.id },
            "likeCount",
            1
        );
    }

    async beforeRemove(event: RemoveEvent<Like>) {
        if (event.entityId) {
            const commentRepository = event.manager.getRepository(Comment);
            await commentRepository.decrement(
                { id: event.entity?.comment.id },
                "likeCount",
                1
            );
        }
    }
}
