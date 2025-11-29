import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Etiqueta } from "@/components/ui/etiqueta";

const Formulario = FormProvider;

const ContextoCampoFormulario = React.createContext({});

const CampoFormulario = ({ ...props }) => {
    return (
        <ContextoCampoFormulario.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </ContextoCampoFormulario.Provider>
    );
};

const useCampoFormulario = () => {
    const contextoCampo = React.useContext(ContextoCampoFormulario);
    const contextoElemento = React.useContext(ContextoElementoFormulario);
    const { getFieldState, formState } = useFormContext();

    const estadoCampo = getFieldState(contextoCampo.name, formState);

    if (!contextoCampo) {
        throw new Error("useCampoFormulario debe utilizarse dentro de <CampoFormulario>");
    }

    const { id } = contextoElemento;

    return {
        id,
        name: contextoCampo.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...estadoCampo,
    };
};

const ContextoElementoFormulario = React.createContext({});

const ItemFormulario = React.forwardRef(({ className, ...props }, ref) => {
    const id = React.useId();

    return (
        <ContextoElementoFormulario.Provider value={{ id }}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
        </ContextoElementoFormulario.Provider>
    );
});
ItemFormulario.displayName = "ItemFormulario";

const EtiquetaFormulario = React.forwardRef(({ className, ...props }, ref) => {
    const { error, formItemId } = useCampoFormulario();

    return (
        <Etiqueta
            ref={ref}
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
});
EtiquetaFormulario.displayName = "EtiquetaFormulario";

const ControlFormulario = React.forwardRef(({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } =
        useCampoFormulario();

    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
});
ControlFormulario.displayName = "ControlFormulario";

const DescripcionFormulario = React.forwardRef(({ className, ...props }, ref) => {
    const { formDescriptionId } = useCampoFormulario();

    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
});
DescripcionFormulario.displayName = "DescripcionFormulario";

const MensajeFormulario = React.forwardRef(({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useCampoFormulario();
    const body = error ? String(error?.message) : children;

    if (!body) {
        return null;
    }

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    );
});
MensajeFormulario.displayName = "MensajeFormulario";

export {
    useCampoFormulario,
    Formulario,
    ItemFormulario,
    EtiquetaFormulario,
    ControlFormulario,
    DescripcionFormulario,
    MensajeFormulario,
    CampoFormulario,
};
