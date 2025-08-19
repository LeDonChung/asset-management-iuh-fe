"use client"
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  router.push('/login'); 
  return (
    <h1>HI</h1>
  );
}
