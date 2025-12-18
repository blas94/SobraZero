import jwt from "jsonwebtoken";

const CLAVE_JWT = process.env.JWT_SECRET || "dev_secret_cambia_esto";

export function middlewareAutenticacion(req, res, next) {
    const headerAuth = req.headers.authorization;

    if (headerAuth && headerAuth.startsWith("Bearer ")) {
        const token = headerAuth.split(" ")[1];
        try {
            req.usuario = jwt.verify(token, CLAVE_JWT);
            return next();
        } catch {
            return res.status(401).json({ error: "Token inválido o expirado" });
        }
    }

    const tokenCookie = req.cookies?.token;
    if (!tokenCookie) return res.status(401).json({ error: "No autorizado" });

    try {
        req.usuario = jwt.verify(tokenCookie, CLAVE_JWT);
        return next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

export function soloAdministrador(req, res, next) {
    if (!req.usuario) return res.status(401).json({ error: "No autorizado" });

    if (req.usuario.rol !== "admin") {
        return res.status(403).json({ error: "Acceso solo para administradores" });
    }

    return next();
}