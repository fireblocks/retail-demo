"use client"
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
  return (
    router.push("/login")
  );
}
