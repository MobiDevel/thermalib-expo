const facebookDependency = 'implementation("com.facebook.react:react-android")';

const localBroadcast = "com.android.support:localbroadcastmanager:28.0.0";

const localBroadcastX =
  "androidx.localbroadcastmanager:localbroadcastmanager:1.0.0";

const withImplementation = (dependency: string) =>
  `implementation(\"${dependency}\")`;

/**
 * Update the `android/app/build.gradle` as a string.
 * @param configModResultsContents `config.modResults.contents` from `withAppBuildGradle`
 * @returns Updated config to set as `config.modResults.contents`
 */
export const UpdateGradle = (configModResultsContents: string) => {
  // Find dependencies start block
  const depBlockIndex = configModResultsContents.indexOf(facebookDependency);

  const mainConfig = configModResultsContents.slice(0, depBlockIndex);

  // Other dependencies and end block
  let otherDependencies = configModResultsContents.slice(
    depBlockIndex + facebookDependency.length
  );

  // Replace duplicates
  otherDependencies = otherDependencies
    .replace(withImplementation(localBroadcastX), "")
    .replace(withImplementation(localBroadcast), "");

  // Add new deps
  // https://stackoverflow.com/questions/74942623/how-can-i-add-to-default-config-in-build-gradle-in-expo-managed-project
  const newContent = `${mainConfig}${facebookDependency}
    ${withImplementation(localBroadcast)}
    ${withImplementation(localBroadcastX)}${otherDependencies}`;

  return newContent;
};
