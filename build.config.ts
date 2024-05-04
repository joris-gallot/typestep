import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  rollup: {
    esbuild: {
      target: "esnext",
    }
  }
});