import {DummyExpoConfig, ExpoConfigModified} from '../DummyExpoConfig';
import {UpdateGradle} from '../UpdateGradle';

describe('UpdateGradle', () => {
  test('should update the `android/app/build.gradle` as a string', () => {
    const result = UpdateGradle(DummyExpoConfig);
    expect(result).toEqual(ExpoConfigModified);
  });
});
