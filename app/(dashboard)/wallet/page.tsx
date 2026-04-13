import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BuyCreditsSection } from "@/components/wallet/buy-credits-section";
import { WithdrawSection } from "@/components/wallet/withdraw-section";
import { Coins, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDate, creditsToEur, MIN_WITHDRAWAL_CREDITS } from "@/lib/utils";

const TX_TYPE_LABELS: Record<string, string> = {
  EARN_UPLOAD: "Câștig material",
  EARN_TUTORING: "Câștig tutoriat",
  EARN_REVIEW: "Câștig recenzie",
  EARN_DAILY: "Bonus zilnic",
  EARN_REFERRAL: "Bonus referral",
  PURCHASE_CREDITS: "Cumpărare credite",
  SPEND_MATERIAL: "Achiziție material",
  SPEND_TUTORING: "Plată tutoriat",
  WITHDRAW: "Retragere",
  REFUND: "Rambursare",
  COMMISSION: "Comision",
};

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, transactions, withdrawals] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalEarned: true,
        totalSpent: true,
        kycStatus: true,
      },
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) redirect("/login");

  const monthlyEarnings = transactions
    .filter((t) => t.amount > 0 && new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portofel</h1>
        <p className="text-muted-foreground">Gestionează-ți creditele și retragerile</p>
      </div>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="font-medium opacity-90">Balanță curentă</span>
            </div>
            <p className="text-4xl font-bold">{user.credits.toLocaleString()}</p>
            <p className="text-violet-200 mt-1">credite = ~{creditsToEur(user.credits).toFixed(2)}€</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">Total câștigat</span>
            </div>
            <p className="text-3xl font-bold">{user.totalEarned.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Luna aceasta: +{monthlyEarnings.toLocaleString()} cr.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-medium">Total cheltuit</span>
            </div>
            <p className="text-3xl font-bold">{user.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Retrageri: {withdrawals.filter((w) => w.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal notice */}
      {user.credits >= MIN_WITHDRAWAL_CREDITS && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Wallet className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">Poți retrage credite!</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Ai {user.credits} credite → {creditsToEur(user.credits).toFixed(2)}€ disponibili pentru retragere
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="buy">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy">Cumpără Credite</TabsTrigger>
          <TabsTrigger value="withdraw">Retrage Bani</TabsTrigger>
          <TabsTrigger value="history">Istoric</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-6">
          <BuyCreditsSection />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-6">
          <WithdrawSection
            currentCredits={user.credits}
            kycStatus={user.kycStatus}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Istoricul Tranzacțiilor</CardTitle>
              <CardDescription>Toate mișcările din contul tău</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nicio tranzacție</p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          tx.amount > 0 ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
                        }`}>
                          {tx.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {TX_TYPE_LABELS[tx.type] ?? tx.type} • {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} cr.
                        </p>
                        <Badge
                          variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "destructive"}
                          className="text-xs"
                        >
                          {tx.status === "COMPLETED" ? "Finalizat" : tx.status === "PENDING" ? "În procesare" : "Eșuat"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
