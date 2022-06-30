import { Changes } from "../../doc/types";

export type ChangesPayload = {
    docId: string;
    changes: Changes;
};

export const changes = 'changes';
