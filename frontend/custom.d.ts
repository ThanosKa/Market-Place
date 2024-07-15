declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const SVG: React.FC<SvgProps>;
  export default SVG;
}

declare module "*.png" {
  const content: any;
  export default content;
}
