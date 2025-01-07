import {
  ConfigPlugin,
  WarningAggregator,
  withAppBuildGradle,
} from 'expo/config-plugins';
import {UpdateGradle} from './UpdateGradle';

const withLocalBroadcastManager: ConfigPlugin<{}> = (config, _props = {}) => {
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withAppGradleDependencies',
        `Cannot automatically configure app/build.gradle if it's not groovy`,
      );
      return config;
    }

    config.modResults.contents = UpdateGradle(config.modResults.contents);

    return config;
  });
  return config;
};

export default withLocalBroadcastManager;
