import * as React from "react";

import { ThermalibExpoViewProps } from "./ThermalibExpo.types";

export default function ThermalibExpoView(props: ThermalibExpoViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
