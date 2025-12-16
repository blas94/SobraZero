import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";

const router = express.Router();

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
    console.warn("[MercadoPago] MP_ACCESS_TOKEN no está definido en el entorno");
}

const mercadopago = new MercadoPagoConfig({
    accessToken,
});

const normalizarURL = (url = "") => url.replace(/\/+$/, "");

router.get("/connect", async (req, res) => {
    try {
        const { usuarioId } = req.query;

        const clientUrl = normalizarURL(process.env.CLIENT_URL || "");

        if (!clientUrl) {
            return res.status(500).json({
                ok: false,
                message: "CLIENT_URL no está definido en el entorno",
            });
        }

        const body = {
            items: [
                {
                    id: "mp-verificacion",
                    title: "Verificación Mercado Pago - SobraZero",
                    quantity: 1,
                    unit_price: 1,
                    currency_id: "ARS",
                },
            ],

            external_reference: usuarioId ? String(usuarioId) : "anon",

            back_urls: {
                success: `${clientUrl}/configuracion?mp=success`,
                failure: `${clientUrl}/configuracion?mp=failure`,
                pending: `${clientUrl}/configuracion?mp=pending`,
            },

            auto_return: "approved",
        };

        const pref = await new Preference(mercadopago).create({ body });

        return res.json({
            ok: true,
            url: pref.sandbox_init_point || pref.init_point,
            preference_id: pref.id,
        });
    } catch (error) {
        console.error(
            "[MercadoPago] Error en /mercadopago/connect:",
            error?.status,
            error?.code,
            error?.message
        );

        return res.status(500).json({
            ok: false,
            message: error?.message || "Error al iniciar el checkout de Mercado Pago",
        });
    }
});

export default router;
