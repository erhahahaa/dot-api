type ParamsRecord = {
  [key: string]: string | number | undefined;
};

export abstract class BaseRepo<T> {
  abstract create(data: T, { creatorId }: { creatorId: number }): Promise<T>;
  abstract update(data: T): Promise<T>;
  abstract delete(id: number): Promise<T>;
  abstract find(id: number): Promise<T>;
  abstract list({}: ParamsRecord): Promise<T[]>;
}
