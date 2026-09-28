"use client"
import Link from "next/link"
import {Icon} from "@/components/ui/icon"
import {Button} from "@/components/ui/button"

export default function Navbar() {
    return (
        <nav
            className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
                {/* Мобильное меню Sneat раскрывается классом layout-menu-expanded на <html>. */}
                <Button type="button" variant="ghost" size="icon" aria-label="Открыть меню"
                        onClick={() => document.documentElement.classList.toggle("layout-menu-expanded")}>
                    <Icon name="menu" className="bx-md"/>
                </Button>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                <ul className="navbar-nav flex-row align-items-center ms-auto">
                    <li className="nav-item">
                        <Link href="/work/settings" className="nav-link">
                            <div className="avatar avatar-online">
                                <img src="/sneat/img/avatars/1.png" alt="avatar" className="rounded-circle"/>
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
