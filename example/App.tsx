import {useEvent} from 'expo'; // App.tsx
import {requireOptionalNativeModule} from 'expo-modules-core';
console.log(
  'Has ThermalibExpo?',
  !!requireOptionalNativeModule('ThermalibExpo'),
);
import thermalib, {
  Device,
  requestBluetoothPermission,
} from '@mobione/thermalib-expo';

import {
  Button,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useState, useEffect, useRef} from 'react';

export default function App() {
  const onChangePayload = useEvent(thermalib, 'onChange');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDev, setSelectedDev] = useState<Device | undefined>(undefined);
  const [reading, setReading] = useState<number | undefined>(undefined);
  const [deviceReady, setDeviceReady] = useState(false);
  const lastDeviceIdRef = useRef<string | undefined>(undefined);

  const startScanning = async () => {
    await requestBluetoothPermission();
    await thermalib?.startScanning();
    getDevices();
  };

  const getDevices = async () => {
    await requestBluetoothPermission();
    (thermalib as any).initThermaLib?.();
    const devs = thermalib?.devices();
    console.log('Devices discovered:', devs);
    if (devs) {
      setDevices(devs.map((d) => d as Device));
    } else {
      console.log('No devices');
    }
  };

  const selectDevice = async (deviceId: string) => {
    console.log('Selecting device:', deviceId);
    const dev = thermalib.readDevice(deviceId) as {device?: Device};
    if (dev?.device?.deviceName) {
      setSelectedDev(dev.device);
      setDeviceReady(false);
      lastDeviceIdRef.current = deviceId;

      // Explicitly connect to the device
      try {
        console.log('Attempting to connect to device:', deviceId);
        await thermalib.connectDevice(deviceId);
        console.log('Device connected:', deviceId);
      } catch (error) {
        console.error('Failed to connect to device:', error);
      }
    } else {
      console.warn('Device not found or invalid:', deviceId);
    }
  };

  const getTemperature = async (deviceId: string) => {
    console.log('Getting temperature for device:', deviceId);
    try {
      (thermalib as any).initThermaLib?.();
      const read = (await thermalib.readTemperature(deviceId)) as {
        reading?: number;
        error?: string;
      };

      if (read.error) {
        console.warn('Temperature error:', read.error);
      } else {
        console.log('Temperature reading:', read.reading);
      }
      setReading(read.reading);
    } catch (e) {
      console.error('Native error in readTemperature:', e);
    }
  };

  useEffect(() => {
    (thermalib as any).initThermaLib?.();
  }, []);

  // Listen for deviceUpdated event via onChangePayload
  useEffect(() => {
    if (onChangePayload?.value) {
      console.log('Device updated event payload:', onChangePayload.value);
      if (
        selectedDev?.identifier &&
        onChangePayload.value.includes(selectedDev.identifier) &&
        onChangePayload.value.includes('updated')
      ) {
        console.log('Device is ready:', selectedDev.identifier);
        setDeviceReady(true);
      } else {
        console.log(
          'Device not ready or event payload mismatch:',
          onChangePayload.value,
        );
      }
    }
  }, [onChangePayload, selectedDev]);

  useEffect(() => {
    setTimeout(() => {
      getDevices();
    }, 3 * 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./assets/thermalib-1024.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.header}>Thermalib Example</Text>
      <ScrollView style={styles.container}>
        <Group name="Async functions">
          <Button title="startScanning" onPress={startScanning} />
          <Button title="devices" onPress={getDevices} />
          <Button
            disabled={!deviceReady}
            title="Get temperature"
            onPress={async () =>
              await getTemperature(selectedDev?.identifier || '')
            }
          />
          {reading && (
            <View style={styles.temperatureView}>
              <Text style={styles.temperatureText}>Reading: {reading}</Text>
            </View>
          )}
        </Group>

        <Group name="Events">
          <Text>{onChangePayload?.value}</Text>
        </Group>
      </ScrollView>
      <Group name="Devices">
        <FlatList
          style={styles.deviceList}
          data={devices}
          keyExtractor={(i) => i.identifier}
          renderItem={(li) => (
            <TouchableOpacity onPress={() => selectDevice(li.item.identifier)}>
              <View style={styles.deviceView}>
                <Text
                  key={
                    li.item.identifier ||
                    li.item.deviceName ||
                    li.item.description
                  }
                >
                  {li.item.identifier} {li.item.deviceName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Group>
    </SafeAreaView>
  );
}

function Group(props: {name: string; children: React.ReactNode}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {fontSize: 17, textAlign: 'center', alignSelf: 'center'},
  groupHeader: {fontSize: 20, marginBottom: 20},
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    gap: 10,
  },
  container: {flex: 1, backgroundColor: '#eee'},
  logo: {width: '100%', alignSelf: 'center', height: 50},
  view: {flex: 1, height: 200},
  deviceList: {minHeight: 80, gap: 5},
  highlight: {fontWeight: '700'},
  btnContainer: {
    gap: 10,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  device: {fontWeight: 500, fontStyle: 'italic'},
  instructions: {flexShrink: 1, maxHeight: 500},
  deviceView: {
    minHeight: 15,
    marginVertical: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  temperatureView: {
    minHeight: 15,
    marginVertical: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#981435',
    padding: 6,
  },
  temperatureText: {color: 'white', fontWeight: 'bold', fontSize: 20},
});
