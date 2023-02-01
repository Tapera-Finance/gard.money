import { useSearchParams } from "react-router-dom";
import { setReferrer, referrer } from "../globals";

export default function Referral() {
    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get("utm_source") != null && referrer == null){
        console.log(searchParams.get("utm_source"));
        setReferrer(searchParams.get("utm_source"));
      }
    return (
        <></>
    );
}