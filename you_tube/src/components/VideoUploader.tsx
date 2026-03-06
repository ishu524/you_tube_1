import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "./ui/input";
import { Check, FileVideo, Upload, X } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import axiosInstance from "@/lib/axiosinstance";

const VideoUploader = ({ channelId, channelName }: any) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoTitle, setVideoTitle] = useState("");
    const [callCreator, setCallCreator] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilechange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];

            if (!file.type.startsWith("video/")) {
                toast.error("Please upload a valid video file.");
                return;
            }

            if (file.size > 100 * 1024 * 1024) {
                toast.error("File size exceeds 100MB limit.");
                return;
            }

            setVideoFile(file);
            const filename = file.name;

            if (!videoTitle) {
                setVideoTitle(filename);
            }
        }
    };

    const resetForm = () => {
        setVideoFile(null);
        setVideoTitle("");
        setCallCreator(false);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadComplete(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cancelUpload = () => {
        if (isUploading) {
            toast.error("Your video upload has been cancelled");
            setIsUploading(false);
        }
    };

    const handleUpload = async () => {
        if (!videoFile || !videoTitle.trim()) {
            toast.error("Please provide file and title");
            return;
        }
        const formdata = new FormData();
        formdata.append("file", videoFile);
        formdata.append("videotitle", videoTitle);
        formdata.append("videochanel", channelName);
        formdata.append("uploader", channelId);
        formdata.append("callCreator", String(callCreator));
        console.log(formdata)
        try {
            setIsUploading(true);
            setUploadProgress(0);
            const res = await axiosInstance.post("/video/upload", formdata, {
                onUploadProgress: (progresEvent: any) => {
                    const progress = Math.round(
                        (progresEvent.loaded * 100) / progresEvent.total
                    );
                    setUploadProgress(progress);
                },
            });
            toast.success("Upload successfully");
            resetForm();
        } catch (error) {
            console.error("Error uploading video:", error);
            toast.error("There was an error uploading your video. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload a video</h2>

            <div className="space-y-4">
                {!videoFile ? (
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-lg font-medium">
                            Drag and drop video files to upload
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or click to select files
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                            MP4, WebM, MOV or AVI • Up to 100MB
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="video/*"
                            onChange={handleFilechange}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <div className="bg-blue-100 p-2 rounded-md">
                                <FileVideo className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{videoFile.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                            {!isUploading && (
                                <Button variant="ghost" size="icon" onClick={cancelUpload}>
                                    <X className="w-5 h-5" />
                                </Button>
                            )}
                            {uploadComplete && (
                                <div className="bg-green-100 p-1 rounded-full">
                                    <Check className="w-5 h-5 text-green-600" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="title">Title (required)</Label>
                                <Input
                                    id="title"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    placeholder="Add a title that describes your video"
                                    disabled={isUploading || uploadComplete}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="callCreator"
                                    checked={callCreator}
                                    onChange={(e) => setCallCreator(e.target.checked)}
                                    disabled={isUploading || uploadComplete}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <Label htmlFor="callCreator" className="text-sm font-medium cursor-pointer">
                                    Enable "Call Creator" option for viewers
                                </Label>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            {!uploadComplete && (
                                <>
                                    <Button onClick={cancelUpload} disabled={uploadComplete}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpload}

                                        disabled={
                                            isUploading || !videoTitle.trim() || uploadComplete
                                        }
                                    >
                                        {isUploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoUploader;
