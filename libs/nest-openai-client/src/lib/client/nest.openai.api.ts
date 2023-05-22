import { OpenAIApi } from '../bridge/api';
import { Configuration, ConfigurationParameters } from './configuration';

export class NestOpenAIConfiguration extends Configuration {
  constructor(param: ConfigurationParameters = {}) {
    super(param);
  }
}

export class NestOpenAIApi extends OpenAIApi {
  protected override configuration: NestOpenAIConfiguration;
  constructor(configuration: NestOpenAIConfiguration) {
    super(configuration);
    this.configuration = configuration;
  }
}
