import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { assertPreviewBackendIsolation } from './scripts/check-preview-backend.mjs'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Forbid building Vercel Previews against the production Supabase project.
// Vercel Preview must explicitly set STAGING_SUPABASE_REF and a matching
// VITE_SUPABASE_URL; this does not affect local or production builds.
assertPreviewBackendIsolation({
  deploymentEnvironment: process.env.VERCEL_ENV,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  stagingProjectRef: process.env.STAGING_SUPABASE_REF,
  productionProjectRef: 'xeljnocizvlmefqovvfw',
})

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
