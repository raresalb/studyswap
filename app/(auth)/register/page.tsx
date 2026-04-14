"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, User, Building2, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useLang } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n/translations";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "COMPANY" | "ADMIN";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "COMPANY", "ADMIN"]),
  adminCode: z.string().optional(),
  university: z.string().optional(),
  companyName: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((d) => {
  if (d.role === "ADMIN") return !!d.adminCode && d.adminCode.length > 0;
  return true;
}, {
  message: "Admin access code is required",
  path: ["adminCode"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roles: { value: Role; icon: React.ElementType; color: string }[] = [
  { value: "STUDENT", icon: GraduationCap, color: "from-violet-500 to-blue-500" },
  { value: "COMPANY", icon: Building2, color: "from-emerald-500 to-teal-500" },
  { value: "ADMIN", icon: Shield, color: "from-orange-500 to-red-500" },
];

export default function RegisterPage() {
  const { toast } = useToast();
  const { lang } = useLang();
  const tr = (key: string) => t(lang, key);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" },
  });

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const getCallbackUrl = (role: Role) => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "COMPANY") return "/company/dashboard";
    return "/feed";
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: getCallbackUrl(data.role),
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Language switcher top-right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">{tr("auth.register.title")}</CardTitle>
          <CardDescription>{tr("auth.register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Role selector */}
          <div className="space-y-2">
            <Label>{tr("auth.register.role")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ value, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRoleSelect(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium",
                    selectedRole === value
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                      : "border-border hover:border-violet-300 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    selectedRole === value
                      ? `bg-gradient-to-br ${color}`
                      : "bg-muted"
                  )}>
                    <Icon className={cn("w-4 h-4", selectedRole === value ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <span className="text-xs">{tr(`auth.register.role.${value.toLowerCase()}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OAuth — only for students */}
          {selectedRole === "STUDENT" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl: "/feed" })}>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" onClick={() => signIn("github", { callbackUrl: "/feed" })}>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </Button>
              </div>
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or with email
                </span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input type="hidden" {...register("role")} value={selectedRole} />

            <div className="space-y-1">
              <Label htmlFor="name">{tr("auth.register.name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="John Smith" className="pl-9" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">{tr("auth.register.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {selectedRole === "STUDENT" && (
              <div className="space-y-1">
                <Label htmlFor="university">{tr("auth.register.university")}</Label>
                <Input id="university" placeholder="e.g. TU Berlin" {...register("university")} />
              </div>
            )}

            {selectedRole === "COMPANY" && (
              <div className="space-y-1">
                <Label htmlFor="companyName">{tr("auth.register.companyName")}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="companyName" placeholder="Acme Corp" className="pl-9" {...register("companyName")} />
                </div>
              </div>
            )}

            {selectedRole === "ADMIN" && (
              <div className="space-y-1">
                <Label htmlFor="adminCode">{tr("auth.register.adminCode")}</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="adminCode" type="password" placeholder={tr("auth.register.adminCodePlaceholder")} className="pl-9" {...register("adminCode")} />
                </div>
                {errors.adminCode && <p className="text-xs text-destructive">{errors.adminCode.message}</p>}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="password">{tr("auth.register.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Min. 8 characters" className="pl-9" {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-9" {...register("confirmPassword")} />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : tr("auth.register.submit")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {tr("auth.register.hasAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {tr("auth.register.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
