import HeaderClient from "./header-client";
import { getUser } from "@/actions/user/get";

const Header = async () => {
  const user = await getUser();

  return <HeaderClient user={user} />;
};

export default Header;
