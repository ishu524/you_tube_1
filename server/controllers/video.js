import video from "../Models/video.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const uploadvideo = async (req, res) => {
    if (req.file === undefined) {
        return res
            .status(400)
            .json({ message: "plz upload a mp4 video file only" });
    } else {
        try {
            console.log("🚀 Starting Cloudinary upload for:", req.file.path);
            const cloudinaryResponse = await uploadToCloudinary(req.file.path);

            if (!cloudinaryResponse) {
                return res.status(500).json({ message: "Cloudinary upload failed" });
            }

            const file = new video({
                videotitle: req.body.videotitle,
                filename: req.file.originalname,
                filepath: cloudinaryResponse.secure_url, // Store the Cloudinary HTTPS URL
                filetype: req.file.mimetype,
                filesize: (req.file.size / 1024 / 1024).toFixed(2) + " MB", // Pre-format size
                videochanel: req.body.videochanel,
                uploader: req.body.uploader,
                callCreator: req.body.callCreator === 'true',
            });
            await file.save();
            return res.status(201).json({ message: "File uploaded successfully to Cloudinary", url: cloudinaryResponse.secure_url });
        } catch (error) {
            console.error("Upload Error:", error);
            return res.status(500).json({ message: "Something went wrong during upload" });
        }
    }
};

export const getallvideo = async (req, res) => {
    try {
        const files = await video.find();
        return res.status(200).send(files);
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};