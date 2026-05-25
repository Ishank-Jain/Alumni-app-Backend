const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// 1. Fetch keys using the internal Docker container name 'alumni-keycloak' and the correct realm
const client = jwksClient({
  jwksUri: "http://alumni-keycloak:8080/realms/application/protocol/openid-connect/certs",
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err, null);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        // 2. The issuer must match what the React app sees in the browser (localhost)
        issuer: "http://localhost:8080/realms/application"
      },
      (err, decoded) => {
        if (err) {
          console.error("JWT Verification Failed:", err.message);
          return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        req.user = decoded;
        
        // 3. Removed the broken Postgres pool.query block. 
        // We rely entirely on your existing syncMongoUser middleware to handle database sync!
        
        next();
      }
    );
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = verifyToken;