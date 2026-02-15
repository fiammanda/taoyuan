import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 30 << 16,
        firefox: 30 << 16,
        safari: 6 << 16,
        edge: 12 << 16
      }
    }
  },
  build: {
    outDir: 'docs',
    cssMinify: 'lightningcss'
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
    tailwindcss(),
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
