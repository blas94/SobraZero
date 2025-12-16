import React from "react";
import {
    Dialogo,
    ContenidoDialogo,
} from "@/components/ui/Dialogo";
import { Boton } from "@/components/ui/Boton";
import { Check } from "lucide-react";
import logo from "@/assets/logo.png";

export function Tutorial({ abierto, paso, alCompletar, alSaltar, textoBoton = "Siguiente" }) {
    if (!paso) return null;

    return (
        <Dialogo open={abierto} onOpenChange={(val) => !val && alSaltar()}>
            <ContenidoDialogo
                overlayClassName="bg-black/30"
                className="sm:max-w-[500px] w-[90vw] max-h-[85vh] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col"
            >
                <div className="relative w-full flex-1 flex flex-col min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center pt-8 sm:pt-10 overflow-y-auto">
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] w-full">

                            {/* Renderizado condicional para pantalla de bienvenida (tiene logo) vs pasos normales */}
                            {paso.esBienvenida ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 drop-shadow-xl">
                                        <img src={logo} alt="SobraZero Logo" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-lg mb-6 sm:mb-8 animate-in fade-in zoom-in duration-500 delay-100 ring-1 ring-gray-100 flex items-center justify-center">
                                    {paso.icono}
                                </div>
                            )}

                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-4 text-gray-900 px-2">
                                {paso.titulo}
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base max-w-[280px] sm:max-w-[320px] mx-auto px-2 font-medium">
                                {paso.descripcion}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 bg-white/50 backdrop-blur-sm border-t border-gray-100 shrink-0 relative z-10 w-full">
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 w-full">
                            {/* Espaciador para centrar en mobile o alinear en desktop */}
                            <div className="hidden sm:block sm:w-1/3"></div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto text-sm sm:text-base sm:w-2/3 justify-end">
                                <Boton
                                    onClick={alCompletar}
                                    className="w-full sm:w-auto rounded-full px-6 sm:px-8 shadow-md hover:shadow-lg transition-all order-1 sm:order-2"
                                >
                                    {textoBoton}
                                    {paso.esUltimo && <Check className="w-4 h-4 ml-2" />}
                                </Boton>

                                {!paso.esUltimo && (
                                    <Boton
                                        variant="ghost"
                                        onClick={alSaltar}
                                        className="w-full sm:w-auto text-gray-600 hover:text-gray-900 hover:bg-transparent px-3 sm:px-4 order-2 sm:order-1"
                                    >
                                        Saltar
                                    </Boton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ContenidoDialogo>
        </Dialogo>
    );
}