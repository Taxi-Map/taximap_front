import { authService, CloudinarySignature } from './authService';

/**
 * Serviço para upload de imagens directamente para o Cloudinary
 * A assinatura vem do backend para proteger a API key
 */
export const cloudinaryService = {
    /**
     * Upload de imagem directamente do browser para o Cloudinary
     * @param file - Ficheiro de imagem a fazer upload
     * @returns URL segura da imagem no Cloudinary
     */
    async uploadImage(file: File): Promise<string> {
        if (!authService.isAuthenticated()) {
            throw new Error('Não autenticado');
        }

        // 1. Buscar assinatura do backend
        const { timestamp, signature, cloudName, apiKey, folder }: CloudinarySignature =
            await authService.getCloudinarySignature();

        // 2. Montar FormData para o upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload directo para o Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error('Cloudinary upload error:', result);
            throw new Error(result.error?.message || 'Erro ao fazer upload da imagem');
        }

        return result.secure_url;
    },

    /**
     * Valida se o ficheiro é uma imagem válida
     * @param file - Ficheiro a validar
     * @returns true se válido
     */
    validateImage(file: File): { valid: boolean; error?: string } {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Tipo de ficheiro inválido. Use JPEG, PNG, GIF ou WebP.' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'Ficheiro muito grande. Máximo 5MB.' };
        }

        return { valid: true };
    },
};

export default cloudinaryService;
