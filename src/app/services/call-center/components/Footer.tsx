import Image from "next/image";
import Link from "next/link";
import container from "@/components/services/Container.module.css";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${container.container} ${styles.footer}`}>
      <Link href="/" aria-label="Center Quest home"><Image src="/logo.png" alt="Center Quest" width={206} height={152} className={styles.footerLogo} /></Link>
      <p>Call Center · BPO · Systems Development</p>
      <Link href="/#services">Back to all services</Link>
    </footer>
  );
}
