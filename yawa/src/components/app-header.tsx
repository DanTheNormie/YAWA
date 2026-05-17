import { SidebarTrigger } from "./ui/sidebar";

export function AppHeader() {
    return (
        <header className="sticky top-0 z-50 h-14 bg-background border-b flex items-center justify-between px-6">
            <SidebarTrigger />
        </header>
    )
}