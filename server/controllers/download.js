import User from "../Models/Auth.js";
import DownloadHistory from "../Models/download.js";
import VideoFiles from "../Models/video.js";

export const downloadVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const video = await VideoFiles.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const today = new Date().setHours(0, 0, 0, 0);
        let userLastDownload = user.lastDownloadDate ? new Date(user.lastDownloadDate).setHours(0, 0, 0, 0) : null;

        // Reset daily count if a new day has started
        if (userLastDownload !== today) {
            user.dailyDownloadCount = 0;
            user.lastDownloadDate = new Date();
        }

        // Apply Free Tier Restrictions
        if (!user.isPremium && user.dailyDownloadCount >= 1) {
            return res.status(403).json({
                success: false,
                message: "Download limit reached. Upgrade to Premium to download unlimited videos."
            });
        }

        // Increment counts and log history
        user.dailyDownloadCount += 1;
        user.lastDownloadDate = new Date();
        await user.save();

        const history = new DownloadHistory({
            userId: user._id,
            videoId: video._id
        });
        await history.save();

        // Simulate secure file response - since videos are currently mocked or localized.
        // Provide frontend with download URL 
        // Important: in a full production setting, you'd send `res.download(video.filepath)`
        // We will send the path/url to the frontend for it to handle the download blob/anchor trigger.
        return res.status(200).json({
            success: true,
            message: "Download approved",
            filePath: video.filepath,
            fileName: video.filename
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getUserDownloads = async (req, res) => {
    try {
        const { userId } = req.params;
        const downloads = await DownloadHistory.find({ userId })
            .populate("videoId")
            .sort({ downloadedAt: -1 });

        res.status(200).json({ success: true, downloads });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching downloads", error: error.message });
    }
};
