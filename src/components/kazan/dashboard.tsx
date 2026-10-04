"use client";

import {
  ArrowRight,
  Check,
  CookingPot,
  Heart,
  Info,
  Sprout,
  Trees,
  Users,
  Utensils,
} from "lucide-react";
import { useForest } from "@/components/forest/provider";
import { SceneContent } from "@/components/ui/scene-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cauldron } from "./cauldron";
import { Courtyard } from "./courtyard";
import {
  formatKazanNumber as number,
  kazanProgress,
  SCHOOL_GOAL,
} from "@/lib/kazan/model";
import styles from "./kazan.module.css";

const contributionSteps = [
  {
    icon: Utensils,
    title: "İhtiyacın kadar al",
    text: "Yiyebileceğin kadar yemek al. Hâlâ açsan yeniden alabilirsin.",
  },
  {
    icon: CookingPot,
    title: "Küçük seçimin kazana eklensin",
    text: "Yemek sonrası kaydınla hesaplanan gıda tasarrufu, okulumuzun ortak toplamına yansır.",
  },
  {
    icon: Trees,
    title: "Birlikte iyiliğe dönüştürelim",
    text: "Hedefe okulca ulaşalım, fidan dikme etkinliğine bir adım daha yaklaşalım.",
  },
];

function SaplingScene() {
  return (
    <svg
      viewBox="0 0 350 150"
      role="img"
      aria-label="Toprağa kök salan genç fidanlar"
      className={styles.saplingScene}
    >
      <defs>
        <linearGradient id="sapling-soil" x2="0" y2="1">
          <stop stopColor="#d5d8b7" />
          <stop offset="1" stopColor="#e9e9d4" />
        </linearGradient>
      </defs>
      <circle cx="264" cy="39" r="25" fill="#e7dcae" opacity=".65" />
      <path d="M0 113Q82 77 180 106Q270 80 350 100V150H0Z" fill="#dfe4cc" />
      <path
        d="M0 132Q83 102 169 125Q274 100 350 124V150H0Z"
        fill="url(#sapling-soil)"
      />
      {[
        { x: 88, y: 121, s: 0.7 },
        { x: 177, y: 129, s: 1 },
        { x: 265, y: 123, s: 0.55 },
      ].map(({ x, y, s }) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cy="1" rx="26" ry="7" fill="#899069" opacity=".2" />
          <path
            d="M0 0Q-3 -44 3 -89"
            fill="none"
            stroke="#7d6b43"
            strokeWidth="4"
          />
          <path d="M0 -47Q-40 -39 -43 -72Q-11 -84 0 -47" fill="#819653" />
          <path d="M0 -62Q38 -54 43 -88Q12 -96 0 -62" fill="#547b48" />
          <path d="M2 -82Q-23 -88 -15 -113Q10 -111 2 -82" fill="#a0ad69" />
          <path
            d="M-32 -66L0 -47 31 -80"
            fill="none"
            stroke="#c7d09c"
            strokeWidth="1"
          />
        </g>
      ))}
      <path
        d="M38 134l-3 -12m3 12 7-10M307 133l-4-15m4 15 7-9"
        stroke="#929f71"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function HowItWorks() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={styles.helpButton}>
          <Info size={15} /> Nasıl katkı sağlarım?
        </button>
      </DialogTrigger>
      <DialogContent className={styles.dialog}>
        <span className={styles.dialogIcon}>
          <Heart size={26} />
        </span>
        <DialogTitle>Her küçük seçim, ortak bir iyilik.</DialogTitle>
        <DialogDescription>
          Kazan bütün okulun. Katılmak için ayrı bir puan toplamana ya da kazana
          elle katkı eklemene gerek yok.
        </DialogDescription>
        <ol className={styles.instructions}>
          {contributionSteps.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <span>{i + 1}</span>
              <div>
                <strong>
                  <Icon size={16} />
                  {title}
                </strong>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.finePrint}>
          Tasarruf, kayıtlı öğünlerin referans miktarlarıyla karşılaştırılarak
          hesaplanır. Kazandaki ürünler bu tasarrufun görsel simgesidir.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ completed }: { completed: boolean }) {
  return (
    <aside className={styles.goalCard} aria-labelledby="kazan-goal-title">
      <div className={styles.goalArt}>
        <SaplingScene />
      </div>
      <div className={styles.goalBody}>
        <h2 id="kazan-goal-title">{SCHOOL_GOAL.title}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <button className={styles.goalButton}>
              {completed ? "Hedef tamamlandı" : "Hedefi keşfet"}
              {completed ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </DialogTrigger>
          <DialogContent className={styles.dialog}>
            <span className={styles.dialogIcon}>
              <Trees size={28} />
            </span>
            <DialogTitle>{SCHOOL_GOAL.title}</DialogTitle>
            <DialogDescription>{SCHOOL_GOAL.description}</DialogDescription>
            <div className={styles.goalDetail}>
              <strong>{number(SCHOOL_GOAL.targetKg)} kg</strong>
              <span>okul genelinde gıda tasarrufu hedefi</span>
            </div>
            <p className={styles.detailCopy}>
              Birlikte toprağa dokunacağımız, fidan dikeceğimiz ve doğanın
              büyümesine eşlik edeceğimiz bir gün hayal ediyoruz. Bu kazan,
              hepimizin o güne katkısı.
            </p>
            <p className={styles.proposalNote}>
              <Info size={17} /> Önerilen etkinlik hedefi. Okul onayı, tarih ve
              yer henüz belirlenmedi.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}

export function KazanDashboard() {
  const { data, error, refresh } = useForest();
  if (!data)
    return (
      <main className="forest-container">
        <div className="forest-loading">
          <CookingPot size={36} />
          <h1>Paylaşım Kazanı</h1>
          <p>{error || "Okulumuzun kazanı hazırlanıyor…"}</p>
          {error && (
            <button className="forest-button" onClick={() => void refresh()}>
              Tekrar dene
            </button>
          )}
        </div>
      </main>
    );
  const progress = kazanProgress(data.summary.savedFood, SCHOOL_GOAL.targetKg);
  const contributors = data.plants.filter((plant) => plant.meals > 0).length;

  return (
    <main className={styles.page}>
      {error && (
        <div className={styles.error} role="alert">
          Güncel veriler alınamadı; son yüklenen toplam gösteriliyor.
          <button onClick={() => void refresh()}>Tekrar dene</button>
        </div>
      )}
      <section className={styles.hero} aria-label="Okulumuzun paylaşım bahçesi">
        <Courtyard />
        <header className={styles.heading}>
          <div className={styles.schoolLine}>{data.school.name}</div>
          <h1>
            Paylaşım Kazanı<span>.</span>
          </h1>
          <HowItWorks />
        </header>
        <section
          className={styles.cauldronPanel}
          aria-label="Okulun ortak kazanı"
        >
          <div className={styles.scene}>
            <Cauldron fill={progress.fill} />
          </div>
          <div className={styles.progressSection}>
            <div className={styles.progressHeading}>
              <div>
                <span>GIDA TASARRUFU{data.demo ? " · ÖRNEK" : ""}</span>
                <strong>
                  {number(progress.totalKg, 1)}{" "}
                  <small>/ {number(SCHOOL_GOAL.targetKg)} kg</small>
                </strong>
              </div>
              <span className={styles.progressPercent}>
                %{progress.percent}
              </span>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Okulun gıda tasarrufu hedefi"
              aria-valuemin={0}
              aria-valuemax={SCHOOL_GOAL.targetKg}
              aria-valuenow={Math.max(
                0,
                Math.min(SCHOOL_GOAL.targetKg, progress.totalKg),
              )}
              aria-valuetext={
                number(progress.totalKg, 1) +
                " kilogram tasarruf, hedef " +
                SCHOOL_GOAL.targetKg +
                " kilogram"
              }
            >
              <span style={{ width: progress.fill * 100 + "%" }} />
              {[25, 50, 75].map((value) => (
                <i key={value} style={{ left: value + "%" }} />
              ))}
            </div>
          </div>
        </section>
        <GoalCard completed={progress.completed} />
      </section>
      <SceneContent>
        <div className={styles.details}>
          <section
            className={styles.collectiveStats}
            aria-label="Okulun ortak katkısı"
          >
            <div>
              <span className={styles.statIcon}>
                <Users size={21} />
              </span>
              <span>
                <strong>
                  {number(contributors)} <small>öğrenci</small>
                </strong>
                <p>Katkı sağlayan öğrenciler</p>
              </span>
            </div>
            <div>
              <span className={styles.statIcon}>
                <Utensils size={20} />
              </span>
              <span>
                <strong>
                  {number(data.summary.meals)} <small>öğün kaydı</small>
                </strong>
                <p>Kaydedilen öğünler</p>
              </span>
            </div>
            <div>
              <span className={styles.statIcon}>
                <Sprout size={22} />
              </span>
              <span>
                <strong>
                  {progress.completed
                    ? "Hedef tamamlandı"
                    : number(progress.remainingKg, 1) + " kg kaldı"}
                </strong>
                <p>Fidan dikme hedefine</p>
              </span>
            </div>
          </section>
        </div>
      </SceneContent>
    </main>
  );
}
