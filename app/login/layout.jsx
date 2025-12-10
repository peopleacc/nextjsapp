export default function LoginLayout({ children }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: "linear-gradient(135deg, #2D336B 0%, #7886C7 35%, #A9B5DF 70%, #FFF2F2 100%)"
            }}
        >
            {children}
        </div>
    );
}
