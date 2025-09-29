import jwt from 'jsonwebtoken';
import redisClient from '../Services/redisService.js';

export const authUser =async (req, res, next) => {
    
    try {
        
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Get token from cookies or Authorization header
        
        
        if (!token) {
            return res.status(401).send({ error: "Unauthorized User" });
        }
        const isBlacklisted = await redisClient.get(token); // Check if token is blacklisted in Redis
       
        if (isBlacklisted) {
            req.cookies.token = null; // Clear the cookie if token is blacklisted
            return res.status(401).send({ error: "Unauthorized User" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
        
    } catch (error) {
        return res.status(401).send({ error: "Unauthorized User" });
    }   
}