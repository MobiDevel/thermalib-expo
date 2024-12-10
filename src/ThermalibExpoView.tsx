import { requireNativeView } from "expo";
import * as React from "react";

import { ThermalibExpoViewProps } from "./ThermalibExpo.types";

const NativeView: React.ComponentType<ThermalibExpoViewProps> =
  requireNativeView("ThermalibExpo");

export default function ThermalibExpoView(props: ThermalibExpoViewProps) {
  return <NativeView {...props} />;
}
