export type Changes = string;

export interface IDocHandler {
  applyDiff(changes: Changes): Promise<void>;
}