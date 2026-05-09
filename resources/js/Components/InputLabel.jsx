export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-[10px] font-bold uppercase tracking-widest text-zenith-charcoal ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
