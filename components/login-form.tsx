"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Harap isi email/NIP dan kata sandi");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(result.error);
        toast.error(result.error);
      } else {
        toast.success("Login berhasil! Mengalihkan ke dashboard sarpras...");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5 w-full", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-3.5" />
            <span>Portal Staf Sarpras UNESA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Masuk Akun Petugas</h1>
          <p className="text-xs text-muted-foreground">
            Akses khusus pengelolaan, verifikasi, dan penugasan teknisi sarpras
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="identifier">Email UNESA / NIP Staf</FieldLabel>
          <Input
            id="identifier"
            type="text"
            placeholder="staff@unesa.ac.id atau 19850115..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
          />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </Field>

        <Field>
          <Button type="submit" className="w-full font-semibold h-10 rounded-xl" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              "Masuk ke Dashboard Staf"
            )}
          </Button>
        </Field>

        <FieldSeparator>Akun Uji Coba Cepat (Demo)</FieldSeparator>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickFill("staff@unesa.ac.id", "password123")}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-xs hover:border-primary hover:bg-accent font-semibold cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Demo Login: Budi Santoso, S.T. (Staf Sarpras)</span>
        </Button>

        {/* Info untuk Mahasiswa & Dosen */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-center space-y-1 mt-1">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Mahasiswa &amp; Dosen tidak perlu login untuk lapor kerusakan.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <ArrowLeft className="size-3" />
            <span>Kembali &amp; Lapor di Beranda Utama</span>
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}
