import React from "react";
import { NavLink } from "@/components/ui/button";
import { H1, Screen } from "@/components/ui/view";

export default function Settings() {
    return (
        <Screen className="items-center justify-center">
            <H1>Settings</H1>

            <NavLink href="/" textClassName="text-4xl mt-8">
                Home
            </NavLink>

            <NavLink href="/profile" textClassName="text-4xl mt-8">
                Profile
            </NavLink>
        </Screen>
    );
}
