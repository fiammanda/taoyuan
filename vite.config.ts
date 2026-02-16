import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs'
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          comments: false
        }
      }
    }),
    legacy({
      targets: ['Chrome >= 51', 'Android >= 7'],
      modernPolyfills: true
    }),
    {
      name: "serve-static",
      configureServer(server) {
        const redirects = [
          { from: "/help", to: "/help/" },
          { from: "/save", to: "/save/" }
        ];
        server.middlewares.use((req, res, next) => {
          if (!req.url) {
            return next();
          }
          const redirect = redirects.find(r => r.from === req.url);
          if (redirect) {
            res.statusCode = 301;
            res.setHeader("Location", redirect.to);
            res.end();
            return;
          }
          if (req.url.endsWith("/")) {
            req.url = `${req.url}index.html`;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
