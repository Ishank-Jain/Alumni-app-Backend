const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const pool = require("../services/postgres.service");

const client = jwksClient({
  jwksUri:
    "http://localhost:8080/realms/Alumni-Portal-External/protocol/openid-connect/certs",
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
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer:
          "http://localhost:8080/realms/Alumni-Portal-External"
      },
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
          });
        }

        req.user = decoded;

        await pool.query(
          `
          INSERT INTO users
          (keycloak_sub, username, email)
          VALUES ($1,$2,$3)

          ON CONFLICT (keycloak_sub)
          DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
          `,
          [
            decoded.sub,
            decoded.preferred_username,
            decoded.email
          ]
        );

        next();
      }
    );

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = verifyToken;