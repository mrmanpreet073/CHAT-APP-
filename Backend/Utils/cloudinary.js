// import { v2 as cloudinary } from "cloudinary";
// import { getBase64 } from "./getBase64.js";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("Cloudinary config:", {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
// });

export default cloudinary;

export const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        console.log("Cloudinary upload started");
        console.log("Buffer size:", buffer.length);

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "chat-app/avatars",
            },
            (error, result) => {

                console.log("Cloudinary callback called");

                if (error) {
                    console.log("Cloudinary ERROR:", error);
                    reject(error);
                } else {
                    console.log("Cloudinary SUCCESS");
                    resolve(result);
                }
            }
        );

        console.log("Upload stream created");

        stream.end(buffer);

        console.log("Buffer sent to stream");
    });
};

const getBase64 = (file) =>
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadFilesToCloudinary = async (files = []) => {
    try {
        const uploadPromises = files.map((file) =>
            cloudinary.uploader.upload(getBase64(file), {  // cloudinary.uploader.upload returns a promise, so we can use Promise.all to wait for all uploads to complete
                resource_type: "auto",
                public_id: uuid(),
                folder: "chat-app/attachments",
            })
        );

        const results = await Promise.all(uploadPromises);

        console.log("Result = ",results);
        

        return results.map((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
        }));
    } catch (error) {
        throw new Error(`Error uploading files to Cloudinary: ${error.message}`);
    }
};



// export const deleteFilesFromCloudinary = async (publicIds = []) => {
//     if (!publicIds.length) return;

//     const deletePromises = publicIds.map((publicId) =>
//         cloudinary.uploader.destroy(publicId, {
//             resource_type: "image",
//         })
//     );

//     await Promise.all(deletePromises);
// };