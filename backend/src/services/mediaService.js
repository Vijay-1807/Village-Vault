const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

class MediaService {
    /**
     * Upload an image to Cloudinary
     * @param {Object} file - Multer file object
     * @returns {Promise<string>} - Secure URL of the uploaded image
     */
    async uploadImage(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'village_vault/messages',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(error);
                    }
                    console.log('Cloudinary upload success:', result.secure_url);
                    resolve(result.secure_url);
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(uploadStream);
        });
    }
}

module.exports = new MediaService();
