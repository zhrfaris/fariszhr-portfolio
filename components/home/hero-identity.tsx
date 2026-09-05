import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import styles from "./home.module.css";
import { User } from "@/actions/user/get/type";

/**
 * Name, role and portrait. Server-rendered and handed to the choreography as a
 * slot, so the pinned hero can stay a client component without dragging the
 * user query into the browser.
 */
const HeroIdentity = ({ user }: { user?: User }) => (
  <div className={styles.identity}>
    <Avatar className="size-[clamp(56px,8.2vh,84px)] rounded-[calc(clamp(56px,8.2vh,84px)/4.2)] shadow-[0_0_0_5px_#fff,0_3px_14px_rgba(0,0,0,.16)]">
      <AvatarImage
        src={user?.photo?.img_url ?? "/faris-profile-pict-grayscale.png"}
        alt=""
      />
      <AvatarFallback>ZHR</AvatarFallback>
    </Avatar>
    <div>
      <h1>{user?.name ?? "Muhammad Faris Azhar"}</h1>
      <p className={styles.role}>
        {user?.occupation ?? "Product Designer"} at
        <Link
          href="https://gojek.design/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Gojek"
        >
          <Image
            src="/gojek-logo.png"
            alt="Gojek"
            width={252}
            height={72}
            className="h-[1.2em] w-auto brightness-50 grayscale transition hover:brightness-100 hover:grayscale-0"
          />
        </Link>
      </p>
    </div>
  </div>
);

export default HeroIdentity;
