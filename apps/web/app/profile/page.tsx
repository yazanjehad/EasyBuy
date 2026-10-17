import { getProfile } from "@/lib/action";
import React from "react";
const Profile = async () => {
    const res =await getProfile();

    return (
        <div>
            <h1>Profile</h1>
            <p>{JSON.stringify(res)}</p>
        </div>
    );
}
export default Profile