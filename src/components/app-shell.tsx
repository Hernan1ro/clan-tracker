"use client";

import { useState, useCallback } from "react";
import { Sidebar, type Page } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { RankingTable } from "./ranking-table";
import { ClanDetailView } from "./clan-detail";
import { BleedTracker } from "./bleed-tracker";
import { SeasonsPage } from "./seasons-page";
import { ProjectionPage } from "./projection-page";
import { GlobalRanking } from "./global-ranking";
import { MemberAnalysis } from "./member-analysis";
import { useClanData, useClanDetail } from "@/lib/use-clan-data";
import { Loader2, WifiOff } from "lucide-react";

const PAGE_TITLES: Record<Page, string> = {
  ranking: "Clan Ranking",
  clan: "Clan Detail",
  bleed: "Bleed Tracker",
  seasons: "Seasons",
  global: "Global Ranking",
  projection: "Projection",
  members: "Member Analysis",
};

export function AppShell() {
  const [currentPage, setCurrentPage] = useState<Page>("ranking");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<number | null>(null);

  const { data, clans, loading, error } = useClanData();
  const clanDetail = useClanDetail(selectedClanId);

  const season = data?.season ?? null;
  const generatedAt = data?.generated_at ?? null;

  const handleSelectClan = useCallback((clanId: number) => {
    setSelectedClanId(clanId);
    setCurrentPage("clan");
  }, []);

  const handleBackFromClan = useCallback(() => {
    setSelectedClanId(null);
    setCurrentPage("ranking");
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    if (page !== "clan") {
      setSelectedClanId(null);
    }
  }, []);

  function renderPage() {
    if (loading && clans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clan data from Ninja Saga...</p>
        </div>
      );
    }

    if (error && clans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <WifiOff className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive font-medium">Failed to load data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      );
    }

    switch (currentPage) {
      case "ranking":
        return <RankingTable clans={clans} onSelectClan={handleSelectClan} season={season} />;

      case "clan":
        if (clanDetail) {
          return (
            <ClanDetailView clan={clanDetail} onBack={handleBackFromClan} />
          );
        }
        return (
          <div className="text-center py-12 text-muted-foreground">
            No clan selected
          </div>
        );

      case "bleed":
        return (
          <BleedTracker clans={clans} onSelectClan={handleSelectClan} />
        );

      case "seasons":
        return <SeasonsPage season={season} clans={clans} onSelectClan={handleSelectClan} />;

      case "global":
        return (
          <GlobalRanking clans={clans} onSelectClan={handleSelectClan} />
        );

      case "projection":
        return <ProjectionPage clans={clans} />;

      case "members":
        return <MemberAnalysis clans={clans} />;

      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}
          title={PAGE_TITLES[currentPage]}
        />
        <main className="flex-1 px-4 py-6 md:px-6 overflow-y-auto">
          {renderPage()}

          {/* Data freshness indicator */}
          {generatedAt && (
            <div className="mt-6 text-center">
              <p className="text-[10px] text-muted-foreground">
                Data from ninjasaga.cc · Last updated: {generatedAt}
                {error && <span className="text-destructive ml-2">(refresh failed)</span>}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
