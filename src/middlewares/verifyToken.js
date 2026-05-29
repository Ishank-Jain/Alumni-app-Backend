const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// 1. Use an environment variable for the internal Kubernetes Keycloak service URL
// Fallback to localhost for local development
const jwksUri = process.env.KEYCLOAK_JWKS_URI || "http://localhost:8080/realms/application/protocol/openid-connect/certs";

const client = jwksClient({
  jwksUri: jwksUri,
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

    // 2. Use an environment variable for the Issuer
    // The issuer must EXACTLY match the URL the frontend used to authenticate
    const issuer = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/application";

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: issuer
      },
      (err, decoded) => {
        if (err) {
          console.error("JWT Verification Failed:", err.message);
          return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = verifyToken;