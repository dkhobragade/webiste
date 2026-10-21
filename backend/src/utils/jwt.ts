import jwt from "jsonwebtoken";


export const generateToken = (userID: string): string => {
    return jwt.sign({id:userID}, process.env.JWT_SECRET as string, {expiresIn: "7d"});
}

export const setAuthCookie = (res: any, token: string): void => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    });
}

export const clearAuthCookie = (res: any): void => {
    res.clearCookie("token","", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
}