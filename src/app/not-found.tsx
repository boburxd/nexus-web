import Link from "next/link"
import {Button} from "@/components/ui/button"

export default function NotFound() {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "2rem 1.5rem",
                background: "var(--background)",
                fontFamily: "'PP Neue Montreal', 'Inter', Arial, sans-serif",
            }}
        >
            <p style={{
                margin: 0,
                fontSize: "clamp(4.5rem, 12vw, 7rem)",
                fontWeight: 500,
                lineHeight: 1,
                color: "var(--foreground)",
            }}>
                404
            </p>
            <h1 style={{
                margin: "0.75rem 0 0",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 500,
                color: "var(--foreground)",
            }}>
                Страница не найдена
            </h1>
            <p style={{
                margin: "1rem 0 2rem",
                maxWidth: 440,
                fontSize: "1rem",
                lineHeight: 1.55,
                color: "var(--muted-foreground)",
            }}>
                Такой страницы нет или она была перемещена. Проверьте адрес или вернитесь на главную.
            </p>
            <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/"/>}>
                На главную
            </Button>
        </main>
    )
}
