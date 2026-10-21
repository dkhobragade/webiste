import {z} from "zod";
import bcrypt from "bcryptjs";
import {User} from "../models/User.js";
import type { Request, Response } from "express";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";

const signupSchema = z.object({
    fullname: z.string().min(3, {message: "Fullname must be at least 3 characters long"}),
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"}),
    mobile: z.string().regex(/^[0-9]{10}$/, {message: "Mobile number must be 10 digits long"})
});

const loginSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
});


export const singup = async (req: Request, res: Response): Promise<void> => {

    try{
        const validatedData = signupSchema.parse(req.body);
        const {fullname, email, password, mobile} = validatedData;

        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400).json({message: "User already exists"});
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: fullname,
            email,
            password: hashedPassword,
            mobile,
            role: "user"
        });
        await newUser.save();

        const token = generateToken(newUser._id.toString());
        setAuthCookie(res, token);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            data:{
                id:newUser._id,
                name:newUser.name,
                email:newUser.email,
                role:newUser.role,
            }
        });

    }
    catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({message: "Invalid input", errors: err.issues});
            return;
        }
        else{
            res.status(500).json({message: "Internal server error"});
        }
    }
}
export const login = async (req: Request, res: Response): Promise<void> => {
    try{

        const validatedData = loginSchema.parse(req.body);
        const {email, password} = validatedData;

        const user = await User.findOne({email});
        if(!user){
            res.status(400).json({message: "Invalid email or password"});
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            res.status(400).json({message: "Invalid email or password"});
            return;
        }

        const token = generateToken(user._id.toString());
        setAuthCookie(res, token);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            data:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            }
        });

    }
    catch(err){
        if(err instanceof z.ZodError){
            res.status(400).json({message: "Invalid input", errors: err.issues});
            return;
        }
        else{
            res.status(500).json({message: "Internal server error"});
        }
    }
}
export const logout = async (req: Request, res: Response): Promise<void> => {

    clearAuthCookie(res);
    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });


}
