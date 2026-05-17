import AppSidebar from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="flex flex-1">
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="bg-accent/20">
                        {children}
                    </SidebarInset>
                </SidebarProvider>

            </div>
        </>
    )
}

export default Layout