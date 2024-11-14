"use client";
import { BiSolidDashboard } from "react-icons/bi";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";

import Link from "next/link";
import styles from "./navlinks.module.css";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Home", href: "/dashboard", icon: BiSolidDashboard },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FaFileInvoiceDollar,
  },
  { name: "Customers", href: "/dashboard/customers", icon: FaUsers },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(styles.link, {
              [styles.active]: pathname === link.href,
            })}
          >
            <LinkIcon className={styles.link_icon} />
            <p className={styles.text}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
