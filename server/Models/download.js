import mongoose from "mongoose";

const downloadHistorySchema = mongoose.Schema({
    userId: { type: String, required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'videofiles', required: true },
    downloadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("DownloadHistory", downloadHistorySchema);
