export type GetHistoryResponse = {
    history: Update[];
};

type Update = {
    id: string;
    state: string;
    userId: string;
    createdAt: string;
};
