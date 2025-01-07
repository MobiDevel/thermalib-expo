import { useEvent } from "expo";
import thermalib, { requestBluetoothPermission } from "thermalib-expo";
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function App() {
  const onChangePayload = useEvent(thermalib, "onChange");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Image
          source={require("./assets/thermalib-1024.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.header}>Thermalib Example</Text>
        <Group name="Async functions">
          <Button
            title="startScanning"
            onPress={async () => {
              await requestBluetoothPermission();
              await thermalib.startScanning();
            }}
          />
          <Button
            title="devices"
            onPress={async () => {
              await requestBluetoothPermission();
              const devs = await thermalib.devices();
              console.log("devices", devs);
            }}
          />
        </Group>
        <Group name="Events">
          <Text>{onChangePayload?.value}</Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
    testAlign: "center",
    alignSelf: "center",
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    gap: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  logo: {
    with: "100%",
    alignSelf: "center",
    height: 180,
  },
  view: {
    flex: 1,
    height: 200,
  },
};
