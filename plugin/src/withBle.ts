import {
  AndroidConfig,
  ConfigPlugin,
  WarningAggregator,
} from "expo/config-plugins";
import { withBluetoothPermissions } from "./withBluetoothPermissions";
import { withBLEAndroidManifest } from "./withBleAndroidManifest";

const withBle: ConfigPlugin<{}> = (config, props = {}) => {
  const _props = props || {};
  console.log("Expo Bluetherm LE Protocol 1.1 integration");

  if ("bluetoothPeripheralPermission" in _props) {
    WarningAggregator.addWarningIOS(
      "bluetoothPeripheralPermission",
      `The iOS permission \`NSBluetoothPeripheralUsageDescription\` is fully deprecated as of iOS 13 (lowest iOS version in Expo SDK 47+). Remove the \`bluetoothPeripheralPermission\` property from the \`@config-plugins/react-native-ble-plx\` config plugin.`
    );
  }
  // iOS
  config = withBluetoothPermissions(config, _props);

  // Android
  config = AndroidConfig.Permissions.withPermissions(config, [
    "android.permission.BLUETOOTH",
    "android.permission.BLUETOOTH_ADMIN",
    "android.permission.BLUETOOTH_CONNECT", // since Android SDK 31
  ]);
  config = withBLEAndroidManifest(config, {
    isBackgroundEnabled: true,
    neverForLocation: false,
  });

  return config;
};

export default withBle;
