import { useEvent } from "expo";
import ThermalibExpo from "thermalib-expo";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useState } from "react";

export default function App() {
  const onChangePayload = useEvent(ThermalibExpo, "onChange");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Constants">
          <Text>{ThermalibExpo.PI}</Text>
        </Group>
        <Group name="Functions">
          <Text>{ThermalibExpo.hello()}</Text>
        </Group>
        <Group name="Async functions">
          <Button
            title="Set value"
            onPress={async () => {
              await ThermalibExpo.setValueAsync("Hello from JS!");
            }}
          />
          <Button
            title="Check bluetooth"
            onPress={() => {
              ThermalibExpo.checkBluetooth();
            }}
          />
          <Button
            title="Start scanning"
            onPress={() => {
              ThermalibExpo.startScanning();
            }}
          />
          <Button
            title="Get devices"
            onPress={() => {
              const devs = ThermalibExpo.getDevices();
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
  view: {
    flex: 1,
    height: 200,
  },
};
