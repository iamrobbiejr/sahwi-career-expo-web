export const formatImageUrl = (url) => {
    if (!url) return null;
    // Remove escaped slashes if they exist
    const sanitizedUrl = url.replace(/\\\//g, '/');

    if (sanitizedUrl.startsWith('http')) {
        return sanitizedUrl;
    }

    // Handle relative paths from Laravel storage
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const baseUrl = apiBaseUrl.replace(/\/api(\/v\d+)?$/, '');

    const path = sanitizedUrl.replace(/^\//, ''); // Remove leading slash
    const fullPath = path.startsWith('storage/') ? path : `storage/${path}`;

    return `${baseUrl}/${fullPath}`;
};
