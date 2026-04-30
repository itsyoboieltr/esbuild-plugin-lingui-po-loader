import path from 'node:path';
import {
  createCompilationErrorMessage,
  createCompiledCatalog,
  getCatalogForFile,
  getCatalogs,
} from '@lingui/cli/api';
import { getConfig } from '@lingui/conf';
import type { PluginBuild } from 'esbuild';

export const linguiPoLoader = () => ({
  name: 'lingui-po-loader',
  setup: async (build: PluginBuild) => {
    const linguiConfig = getConfig({ skipValidation: true });
    const linguiCatalogs = await getCatalogs(linguiConfig);
    const linguiRootDir = linguiConfig.rootDir ?? process.cwd();

    build.onLoad({ filter: /\.po$/ }, async ({ path: pathToFile }) => {
      const catalogRelativePath = path.relative(linguiRootDir, pathToFile);
      const fileCatalog = getCatalogForFile(catalogRelativePath, linguiCatalogs);

      if (!fileCatalog) {
        const catalogPaths =
          linguiConfig.catalogs?.map((catalog) => catalog.path).join('\n') ??
          'No catalogs configured';
        throw new Error(`Lingui catalog not found for ${pathToFile}.

Resource: ${catalogRelativePath}

Your catalogs:
${catalogPaths}`);
      }

      const { catalog, locale } = fileCatalog;
      const { messages } = await catalog.getTranslations(locale, {
        fallbackLocales: linguiConfig.fallbackLocales,
        sourceLocale: linguiConfig.sourceLocale,
      });
      const strict = process.env.NODE_ENV !== 'production';
      const { errors, source } = createCompiledCatalog(locale, messages, {
        strict,
        namespace: 'es',
        pseudoLocale: linguiConfig.pseudoLocale,
        compilerBabelOptions: linguiConfig.compilerBabelOptions,
        outputPrefix: '',
      });

      if (errors.length > 0) {
        console.warn(createCompilationErrorMessage(locale, errors));
      }

      return {
        contents: source,
        loader: 'js',
      };
    });
  },
});
