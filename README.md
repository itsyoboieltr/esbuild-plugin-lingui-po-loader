# esbuild-plugin-lingui-po-loader

An esbuild plugin to load lingui catalogs from .po files.

## Install

```bash
bun add esbuild-plugin-lingui-po-loader
```

## Usage

```ts
import { build } from "esbuild";
import { linguiPoLoader } from "esbuild-plugin-lingui-po-loader";

build({
  ...,
  plugins: [linguiPoLoader()],
});
```
