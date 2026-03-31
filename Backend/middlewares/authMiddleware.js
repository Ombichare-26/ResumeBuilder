import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json("No token");

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.id;
        next();
    } catch {
        res.status(403).json("Invalid token");
    }
};

export default authMiddleware;