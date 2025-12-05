/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import fs from 'fs/promises';
import path from 'path';

// TODO: move to separate package and publish on npm
function rewriteDynamicImportsEsbuild({packageName}: {packageName?: 'animations' | 'brand-visuals' | 'icons'} = {}) {
  let data: {
    componentFile: RegExp;
    dynamicImport: RegExp;
    packageQualifier: string;
  };
  switch (packageName) {
    case 'animations':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/animation\/animation\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/animations\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/animations'
      };
      break;
    case 'brand-visuals':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/brandvisual\/brandvisual\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/brand-visuals\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/brand-visuals'
      };
      break;
    case 'icons':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/icon\/icon\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/icons\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/icons'
      };
      break;
    default:
      throw new Error('Invalid packageName for rewriteDynamicImportsEsbuild');
  }

  return {
    name: 'rewrite-dynamic-imports-esbuild',
    setup(build: any) {
      build.onLoad({ filter: data.componentFile }, async (args: any) => {
        const code = await fs.readFile(args.path, 'utf8');
        const replaced = code.replace(data.dynamicImport,
          (_match: string, importSubPath: string) => {
            const nodeModulesPath = path.join(process.cwd(), 'node_modules');
            const fullImportPath = path.join(nodeModulesPath, data.packageQualifier, importSubPath);
            const rel = path.relative(path.dirname(args.path), fullImportPath).replaceAll('\\', '/');
            return `import(\`${rel.startsWith('.') ? rel : './' + rel}\`)`;
          }
        );
        return {
          contents: replaced,
          loader: 'js',
        };
      });
    }
  };
}

// TODO: move to separate package and publish on npm
function rewriteDynamicImportsRollup({packageName}: {packageName?: 'animations' | 'brand-visuals' | 'icons'} = {}) {
  let data: {
    componentFile: RegExp;
    dynamicImport: RegExp;
    packageQualifier: string;
  }
  switch (packageName) {
    case 'animations':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/animation\/animation\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/animations\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/animations'
      };
      break;
    case 'brand-visuals':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/brandvisual\/brandvisual\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/brand-visuals\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/brand-visuals'
      };
      break;
    case 'icons':
      data = {
        componentFile: /node_modules\/@momentum-design\/components\/dist\/components\/icon\/icon\.component\.js$/,
        dynamicImport: /import\(\s*`@momentum-design\/icons\/([^`]+)`\s*\)/g,
        packageQualifier: '@momentum-design/icons'
      };
      break;
    default:
      throw new Error('Invalid packageName for rewriteDynamicImportsRollup');
  }

  return {
    name: 'rewrite-dynamic-imports-rollup',
    enforce: 'pre',
    async transform(code: any, id: any) {
      if (!data.componentFile.test(id)) return null;
      const replaced = code.replace(data.dynamicImport,
        (_match: string, importSubPath: string) => {
          const nodeModulesPath = path.join(process.cwd(), 'node_modules');
          const fullImportPath = path.join(nodeModulesPath, data.packageQualifier, importSubPath);
          const rel = path.relative(path.dirname(id), fullImportPath).replaceAll('\\', '/');
          return `import(\`${rel.startsWith('.') ? rel : './' + rel}\`)`;
        }
      );
      return {
        code: replaced,
        map: null,
      };
    },
  };
}

export default defineConfig({
  base: '/ch-ai-agent/', 
  plugins: [
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        rewriteDynamicImportsEsbuild({packageName: 'brand-visuals'}), 
        rewriteDynamicImportsEsbuild({packageName: 'icons'}),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rewriteDynamicImportsRollup({packageName: 'brand-visuals'}), 
        rewriteDynamicImportsRollup({packageName: 'icons'}),
        rewriteDynamicImportsRollup({packageName: 'animations'}),
        dynamicImportVars({
          exclude: ['node_modules/@momentum-design/animations/**'],
          warnOnError: true,
        }),
      ],
    }
  },
});
