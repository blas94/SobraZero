import {
    ShoppingCart,
    Salad,
    Croissant,
    Store,
    UtensilsCrossed,
} from "lucide-react";

export const categorias = [
    { id: "all", label: "Todos", icon: Store },
    { id: "panaderia", label: "Panadería", icon: Croissant },
    { id: "supermercado", label: "Supermercado", icon: ShoppingCart },
    { id: "verduleria", label: "Verdulería", icon: Salad },
    { id: "restaurante", label: "Restaurante", icon: UtensilsCrossed },
];
