import {Router} from "express";
import { singup, login, logout } from "../controllers/auth.controllers.js";


const router = Router();

router.post("/signup", singup);
router.post("/login", login);
router.post("/logout", logout);

export default router;