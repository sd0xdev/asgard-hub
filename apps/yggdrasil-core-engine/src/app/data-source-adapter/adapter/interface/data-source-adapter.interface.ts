export interface IDataSourceAdapter {
  getData<T>(url: string): Promise<T>;
  getDataFromPath<T>(path: string, asExtension: string): Promise<T>;
  getDataAsPath<T>(url: string): Promise<T>;
  getDataSourceType: () => Promise<string>;
}
export abstract class BaseDataSourceAdapter implements IDataSourceAdapter {
  constructor(protected dataSourceType: string) {}

  public async getData(url: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public getDataAsPath(url: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async getDataFormUrlSaveAsPath(
    url: string,
    asExtension: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async getDataFromPath(path: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async getDataSourceType(): Promise<string> {
    return this.dataSourceType;
  }
}
