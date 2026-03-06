import comment from "../Models/comment.js";
import mongoose from "mongoose";
import axios from "axios";
import translate from "google-translate-api-x";

export const postcomment = async (req, res) => {
    const commentdata = req.body;

    // Attempt IP Geolocation
    let city = "Unknown";
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        // For local testing, ip might be ::1, so ip-api might fail or return default
        const cleanIp = ip.split(',')[0].trim() === '::1' ? '' : ip.split(',')[0].trim();
        const geoResponse = await axios.get(`http://ip-api.com/json/${cleanIp}`);
        if (geoResponse.data && geoResponse.data.status === "success" && geoResponse.data.city) {
            city = geoResponse.data.city;
        }
    } catch (error) {
        console.error("Geolocation error:", error.message);
    }

    const postcomment = new comment({ ...commentdata, city });
    try {
        await postcomment.save();
        return res.status(200).json({ comment: true, data: postcomment });
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getallcomment = async (req, res) => {
    const { videoid } = req.params;
    try {
        const commentvideo = await comment.find({ videoid: videoid }).sort({ createdAt: -1 });
        return res.status(200).json(commentvideo);
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    try {
        await comment.findByIdAndDelete(_id);
        return res.status(200).json({ comment: true });
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(_id, {
            $set: { commentbody: commentbody },
        });
        res.status(200).json(updatecomment);
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// --- ADVANCED FEATURES ---

export const likeComment = async (req, res) => {
    const { id: _id } = req.params;
    const { userid } = req.body; // In production this comes from auth middleware

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");

    try {
        const currentComment = await comment.findById(_id);
        if (!currentComment) return res.status(404).json({ message: "Comment not found" });

        const hasLiked = currentComment.likedBy.includes(userid);
        const hasDisliked = currentComment.dislikedBy.includes(userid);

        let updateQuery = {};

        if (hasLiked) {
            // Remove Like
            updateQuery = { $inc: { likes: -1 }, $pull: { likedBy: userid } };
        } else {
            // Add Like, remove dislike if exists
            updateQuery = {
                $inc: { likes: 1, dislikes: hasDisliked ? -1 : 0 },
                $push: { likedBy: userid },
                $pull: { dislikedBy: userid }
            };
        }

        const updated = await comment.findByIdAndUpdate(_id, updateQuery, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const dislikeComment = async (req, res) => {
    const { id: _id } = req.params;
    const { userid } = req.body; // In production this comes from auth middleware

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");

    try {
        const currentComment = await comment.findById(_id);
        if (!currentComment) return res.status(404).json({ message: "Comment not found" });

        const hasLiked = currentComment.likedBy.includes(userid);
        const hasDisliked = currentComment.dislikedBy.includes(userid);

        // Moderation Rule: If dislike is added and total dislikes will reach 2 (currently 1)
        if (!hasDisliked && currentComment.dislikes >= 1) {
            await comment.findByIdAndDelete(_id);
            return res.status(200).json({ deleted: true, message: "Comment auto-deleted due to moderation rules (2 dislikes)." });
        }

        let updateQuery = {};

        if (hasDisliked) {
            // Remove Dislike
            updateQuery = { $inc: { dislikes: -1 }, $pull: { dislikedBy: userid } };
        } else {
            // Add Dislike, remove like if exists
            updateQuery = {
                $inc: { dislikes: 1, likes: hasLiked ? -1 : 0 },
                $push: { dislikedBy: userid },
                $pull: { likedBy: userid }
            };
        }

        const updated = await comment.findByIdAndUpdate(_id, updateQuery, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const translateComment = async (req, res) => {
    const { id: _id } = req.params;
    const { targetLang } = req.body; // e.g., 'es', 'fr', 'en'

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");
    if (!targetLang) return res.status(400).json({ message: "Target language required" });

    try {
        const currentComment = await comment.findById(_id);
        if (!currentComment) return res.status(404).json({ message: "Comment not found" });

        // Check if cached
        const cached = currentComment.translatedCache.get(targetLang);
        if (cached) {
            return res.status(200).json({ translatedText: cached });
        }

        // Translate
        const resTranslation = await translate(currentComment.commentbody, { to: targetLang });
        const translatedText = resTranslation.text;

        // Save to cache
        currentComment.translatedCache.set(targetLang, translatedText);

        // Also update detectedLanguage if not set correctly
        if (currentComment.detectedLanguage === "auto" && resTranslation.from && resTranslation.from.language) {
            currentComment.detectedLanguage = resTranslation.from.language.iso;
        }

        await currentComment.save();

        return res.status(200).json({ translatedText });
    } catch (error) {
        console.error("Translation API error:", error);
        return res.status(500).json({ message: "Translation failed" });
    }
};