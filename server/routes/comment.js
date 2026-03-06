import express from "express";
import {
    deletecomment, getallcomment, postcomment, editcomment,
    likeComment, dislikeComment, translateComment
} from "../controllers/comment.js";
import { validateComment } from "../middleware/commentValidation.js";

const routes = express.Router();

routes.get("/:videoid", getallcomment);
routes.post("/postcomment", validateComment, postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);

// Advanced Routes
routes.post("/:id/like", likeComment);
routes.post("/:id/dislike", dislikeComment);
routes.post("/:id/translate", translateComment);

export default routes;