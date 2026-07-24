// authMiddleware.js

function authMiddleware(req, res, next) {
    // 1. Get the API key from the "x-api-key" header, or fall back to
    //    an "Authorization: Bearer <key>" header.
    let apiKey = req.header("x-api-key");

    if (!apiKey) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            apiKey = authHeader.slice("Bearer ".length).trim();
        }
    }

    // 2. Check if the key is present
    if (!apiKey) {
        return res.status(401).json({ error: "Unauthorized: API key is required" });
    }

    // 3. Check if the key matches the one in your environment variables
    const validApiKey = process.env.API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    // 4. If all checks pass, proceed to the route handler
    next();
}

module.exports = authMiddleware;
