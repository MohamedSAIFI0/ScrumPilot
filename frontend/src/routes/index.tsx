import { Routes, Route } from "react-router-dom";
import ClientPage from "../pages/ClientPage";
import MainPage from "../pages/MainPage";
import ProductOwnerPage from "../pages/ProductOwnerPage";
import AdminPage from "../pages/AdminPage";
import DevTeamPage from "../pages/DevTeamPage";
import ScrumMasterPage from "../pages/ScrumMasterPage";

export default function AppRoutes(){

    return(
        <Routes>
            <Route path="/*" element={<MainPage/>}/>
            <Route path="/client" element={<ClientPage/>}/>
            <Route path="/product-owner" element={<ProductOwnerPage/>}  />
            <Route path="/admin" element={<AdminPage/>}/>
            <Route path="/dev-team" element={<DevTeamPage/>} />
            <Route path="scrum-master" element={<ScrumMasterPage/>}/>
        </Routes>

    );
}