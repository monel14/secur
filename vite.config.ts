import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Build optimizations
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          utils: ['@google/genai']
        }
      }
    }
  },
  
  // Development server
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  
  // Preview server
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  }
});
