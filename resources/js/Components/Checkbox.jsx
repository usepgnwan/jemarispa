export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-zenith-orange/20 text-zenith-orange shadow-sm focus:ring-zenith-orange ' +
                className
            }
        />
    );
}
