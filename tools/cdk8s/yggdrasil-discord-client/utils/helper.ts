export class Helper {
  static get isProd() {
    return (
      process.env.NODE_ENV?.toLocaleLowerCase().includes('production') ?? false
    );
  }
}
