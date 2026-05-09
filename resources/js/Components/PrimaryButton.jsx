export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-zenith-orange px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 ease-in-out hover:bg-zenith-charcoal focus:bg-zenith-charcoal focus:outline-none focus:ring-2 focus:ring-zenith-orange focus:ring-offset-2 active:bg-zenith-charcoal shadow-lg shadow-zenith-orange/20 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
