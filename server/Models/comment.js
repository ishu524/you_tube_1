import mongoose from "mongoose";
const commentschema = mongoose.Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        videoid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "videofiles",
            required: true,
        },
        commentbody: { type: String, required: true },
        usercommented: { type: String },
        commentedon: { type: Date, default: Date.now },

        // Advanced Features Fields
        detectedLanguage: { type: String, default: "auto" },
        translatedCache: {
            type: Map,
            of: String, // targetLanguage: translatedText
            default: {}
        },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        city: { type: String, default: "Unknown" }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("comment", commentschema);