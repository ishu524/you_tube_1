import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
    _id: string;
    videoid: string;
    userid: string;
    commentbody: string;
    usercommented: string;
    commentedon: string;
    likes?: number;
    dislikes?: number;
    likedBy?: string[];
    dislikedBy?: string[];
    city?: string;
    translatedCache?: Record<string, string>;
}

// Expansive list of world languages for translation
const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "pt", name: "Portuguese" },
    { code: "it", name: "Italian" },
    { code: "ko", name: "Korean" },
    { code: "vi", name: "Vietnamese" },
    { code: "th", name: "Thai" },
    { code: "tr", name: "Turkish" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "sv", name: "Swedish" },
    { code: "id", name: "Indonesian" },
    { code: "uk", name: "Ukrainian" },
    { code: "el", name: "Greek" },
    { code: "he", name: "Hebrew" },
    { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" },
    { code: "no", name: "Norwegian" },
    { code: "cs", name: "Czech" },
    { code: "ro", name: "Romanian" },
    { code: "hu", name: "Hungarian" },
    { code: "ms", name: "Malay" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ur", name: "Urdu" },
    { code: "fa", name: "Persian" },
    { code: "sw", name: "Swahili" },
    { code: "tl", name: "Tagalog" }
];

const Comments = ({ videoId }: any) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [translatingId, setTranslatingId] = useState<string | null>(null);
    const [selectedLanguages, setSelectedLanguages] = useState<Record<string, string>>({}); // Tracks targetLang per comment

    useEffect(() => {
        loadComments();
    }, [videoId]);

    const loadComments = async () => {
        try {
            const res = await axiosInstance.get(`/comment/${videoId}`);
            setComments(res.data);

            // Initialize default language for all loaded comments
            const defaultLangs: Record<string, string> = {};
            res.data.forEach((c: Comment) => {
                defaultLangs[c._id] = "en";
            });
            setSelectedLanguages(prev => ({ ...defaultLangs, ...prev }));

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading comments...</div>;
    }

    const fetchUserCity = async (): Promise<string> => {
        try {
            // BigDataCloud is exceptionally accurate for Indian regions (Jaipur, Rajasthan vs standard ISP routed Jodhpur/Delhi)
            // It uses a combination of network information, localized language hints, and client headers to yield precise locality.
            const response = await axios.get("https://api.bigdatacloud.net/data/reverse-geocode-client");

            if (response.data && response.data.city) {
                return response.data.city;
            } else if (response.data && response.data.locality) {
                return response.data.locality;
            } else if (response.data && response.data.principalSubdivision) {
                return response.data.principalSubdivision; // e.g. Rajasthan
            }
            return "Unknown";
        } catch (error) {
            console.error("Failed to fetch exact location", error);
            return "Unknown";
        }
    };

    const handleSubmitComment = async () => {
        if (!user || !newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const city = await fetchUserCity();

            const res = await axiosInstance.post("/comment/postcomment", {
                videoid: videoId,
                userid: user._id,
                commentbody: newComment,
                usercommented: user.name,
                city: city // Send perfect location
            });

            if (res.data.comment) {
                await loadComments();
                setNewComment("");
                toast.success("Comment posted successfully");
            }
        } catch (error: any) {
            console.error("Error adding comment:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to post comment");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (comment: Comment) => {
        setEditingCommentId(comment._id);
        setEditText(comment.commentbody);
    };

    const handleUpdateComment = async () => {
        if (!editText.trim()) return;
        try {
            const res = await axiosInstance.post(
                `/comment/editcomment/${editingCommentId}`,
                { commentbody: editText }
            );
            if (res.data) {
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === editingCommentId ? { ...c, commentbody: editText } : c
                    )
                );
                setEditingCommentId(null);
                setEditText("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
            if (res.data.comment) {
                setComments((prev) => prev.filter((c) => c._id !== id));
                toast.success("Comment deleted");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleLike = async (id: string) => {
        if (!user) return toast.error("Please login to like comments");
        try {
            const res = await axiosInstance.post(`/comment/${id}/like`, { userid: user._id });
            if (res.data) {
                setComments(comments.map(c => c._id === id ? { ...c, ...res.data } : c));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDislike = async (id: string) => {
        if (!user) return toast.error("Please login to dislike comments");
        try {
            const res = await axiosInstance.post(`/comment/${id}/dislike`, { userid: user._id });
            if (res.data && res.data.deleted) {
                toast.success(res.data.message);
                setComments(comments.filter(c => c._id !== id));
            } else if (res.data) {
                setComments(comments.map(c => c._id === id ? { ...c, ...res.data } : c));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleTranslate = async (id: string, code?: string) => {
        const targetLang = code || selectedLanguages[id] || 'en';
        setTranslatingId(id);

        try {
            const res = await axiosInstance.post(`/comment/${id}/translate`, { targetLang });
            if (res.data && res.data.translatedText) {
                setComments(comments.map(c => {
                    if (c._id === id) {
                        return {
                            ...c,
                            translatedCache: { ...(c.translatedCache || {}), [targetLang]: res.data.translatedText }
                        };
                    }
                    return c;
                }));
                toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLang)?.name}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to translate comment");
        } finally {
            setTranslatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

            {user && (
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e: any) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setNewComment("")}
                                disabled={!newComment.trim()}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isSubmitting}
                            >
                                {isSubmitting ? "Posting..." : "Comment"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4">
                            <Avatar className="w-10 h-10">
                                <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {comment.usercommented}
                                    </span>
                                    {comment.city && comment.city !== "Unknown" && (
                                        <>
                                            <span className="text-gray-400">•</span>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {comment.city}
                                            </div>
                                        </>
                                    )}
                                    <span className="text-gray-400">•</span>
                                    <span className="text-xs text-gray-600">
                                        {formatDistanceToNow(new Date(comment.commentedon))} ago
                                    </span>
                                </div>

                                {editingCommentId === comment._id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={handleUpdateComment}
                                                disabled={!editText.trim()}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    setEditText("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm">
                                            {/* Render based on translation matching the current selected language */}
                                            {comment.translatedCache && comment.translatedCache[selectedLanguages[comment._id] || 'en']
                                                ? comment.translatedCache[selectedLanguages[comment._id] || 'en']
                                                : comment.commentbody}
                                        </p>

                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleLike(comment._id)}
                                                    className={`hover:bg-gray-100 p-1.5 rounded-full transition-colors ${comment.likedBy?.includes(user?._id) ? 'text-black' : 'text-gray-600'}`}
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs text-gray-600 mr-2">{comment.likes || 0}</span>

                                                <button
                                                    onClick={() => handleDislike(comment._id)}
                                                    className={`hover:bg-gray-100 p-1.5 rounded-full transition-colors ${comment.dislikedBy?.includes(user?._id) ? 'text-black' : 'text-gray-600'}`}
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs text-gray-600">{comment.dislikes || 0}</span>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        disabled={translatingId === comment._id}
                                                        className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        {translatingId === comment._id ? "Translating..." : "Translate"}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="max-h-60 overflow-y-auto">
                                                    {LANGUAGES.map(lang => (
                                                        <DropdownMenuItem
                                                            key={lang.code}
                                                            onClick={() => {
                                                                setSelectedLanguages(prev => ({ ...prev, [comment._id]: lang.code }));
                                                                handleTranslate(comment._id, lang.code);
                                                            }}
                                                            className="text-xs cursor-pointer"
                                                        >
                                                            {lang.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {comment.userid === user?._id && (
                                            <div className="flex gap-2 mt-2 text-sm text-gray-500">
                                                <button onClick={() => handleEdit(comment)} className="hover:text-black">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(comment._id)} className="hover:text-black">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments; 