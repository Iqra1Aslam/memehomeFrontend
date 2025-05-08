import { defineConfig, UserConfigExport, ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-polyfill-node';
// import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util'
    }
  },
  define: {
    'process.env': process.env
  },
  plugins: [react(),
    nodePolyfills({
      include: ["buffer"]
    }),
  ],
  optimizeDeps: {
    //exclude: ['web3]
  }
})
