import type { Picture } from 'vite-imagetools';

// Client-side enhanced image resolver
const enhancedImageMap = new Map<string, Picture>();

// Load enhanced images on the client
const enhancedImageModules = import.meta.glob<Picture>(
    '/src/lib/assets/images/**/*.{avif,gif,jpeg,jpg,png,webp}',
    {
        query: { enhanced: true },
        eager: true,
        import: 'default'
    }
);

// Build the enhanced image map
for (const [path, picture] of Object.entries(enhancedImageModules)) {
    const aliasPath = path.replace('/src/lib/', '$lib/');
    enhancedImageMap.set(aliasPath, picture);
}

export function getEnhancedImage(imagePath: string): Picture | null {
    return enhancedImageMap.get(imagePath) || null;
}

export function hasEnhancedImage(imagePath: string): boolean {
    return enhancedImageMap.has(imagePath);
}
