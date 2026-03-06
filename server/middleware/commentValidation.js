export const validateComment = (req, res, next) => {
    const { commentbody } = req.body;

    if (!commentbody || typeof commentbody !== 'string' || commentbody.trim() === '') {
        return res.status(400).json({ message: "Comment cannot be empty." });
    }

    // Reject comments that are only symbols or have excessive special characters
    // This regex checks if there are any letters or numbers. If there are none, it's just symbols/spaces.
    const hasLettersOrNumbers = /[a-zA-Z0-9\u00C0-\u017F\u0400-\u04FF\u0900-\u097F\u4E00-\u9FFF]/.test(commentbody);

    if (!hasLettersOrNumbers) {
        return res.status(400).json({ message: "Comments must contain valid text, not just symbols." });
    }

    // Optional: Check for excessive repeated special characters (e.g., @@@@@@!!!!)
    const excessiveSymbolsConfig = /([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\1{4,}/;
    if (excessiveSymbolsConfig.test(commentbody)) {
        return res.status(400).json({ message: "Comment contains excessive special characters." });
    }

    next();
};
