import React from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
const Dashbourd = async() => {
    const session = await getSession();
    if (!session || !session.user) redirect("/auth/signin");
    return <div>Dashbourd</div>;


};

export default Dashbourd;