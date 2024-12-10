import { ConfigPlugin } from "expo/config-plugins";

const withHello: ConfigPlugin = (config) => {
  console.log("Expo Bluetherm LE Protocol 1.1 integration");
  return config;
};

export default withHello;
