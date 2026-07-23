// authMiddleware.js

function authMiddleware(req, res, next) {
    // 1. Get the API key from the request header
    const apiKey = req.header("x-api-key");

    // 2. Check if the key is present
    if (!apiKey) {
        return res.status(400).json({ error: "API key is required!" });
    }

    // 3. Check if the key matches the one in your environment variables
    const validApiKey = process.env.API_KEY;
    if (apiKey !== validApiKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    // 4. If all checks pass, proceed to the route handler
    next();
}

module.exports = authMiddleware;
