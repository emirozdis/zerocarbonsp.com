# Experimental school showcase

All names, card numbers, meal records, and environmental outcomes below are fictional experimental data.

- Database: `showcase.sqlite` (ignored by Git).
- School: **Yeşil Vadi Deney Okulu**; school ID: `default`.
- Period: **2026-09-01 through 2026-09-30**, weekdays only.
- Usage: **22 lunches per student**, **220 total scans**.
- Baselines: 450 g food, 1800 g CO₂, 500 L embodied water; waste target 15%.

Sign in through “Kartımla giriş” with any card below. Start with **TEST001** for a healthy tree, **TEST003** for recovery, or **TEST004** for a recent setback. The signed-out preview is a separate synthetic demo; sign in to see this database's 10 students.

| Test card | Placeholder student | Scenario | Stage after the month | Vitality | Virtual height |
| --- | --- | --- | --- | --- | --- |
| TEST001 | Öğrenci 1 | Düzenli düşük israf | Genç ağaç | 100% | 3.60 m |
| TEST002 | Öğrenci 2 | Ay boyunca giderek iyileşen alışkanlıklar | Fidan | 99% | 0.94 m |
| TEST003 | Öğrenci 3 | Bir aksaklığın ardından toparlanma | Fidan | 99% | 1.08 m |
| TEST004 | Öğrenci 4 | Son hafta daha çok özen isteyen ağaç | Fidan | 36% | 0.95 m |
| TEST005 | Öğrenci 5 | İyi ve zor öğünler bir arada | Fidan | 99% | 1.20 m |
| TEST006 | Öğrenci 6 | Sık sık tamamen israfsız öğünler | Genç ağaç | 100% | 3.74 m |
| TEST007 | Öğrenci 7 | Küçük ama istikrarlı adımlar | Fidan | 100% | 1.38 m |
| TEST008 | Öğrenci 8 | Daha yavaş büyüyen bir filiz | Fidan | 91% | 0.80 m |
| TEST009 | Öğrenci 9 | Zor bir ay, yeni başlangıç fırsatı | Filiz | 15% | 0.52 m |
| TEST010 | Öğrenci 10 | Güçlü başlayan, dengeli devam eden gelişim | Genç ağaç | 100% | 2.32 m |

Run `npm run seed:showcase` to create the fixture. Rerunning preserves the existing database. To explicitly reset this showcase, use `npm run seed:showcase -- --reset`; reset revokes showcase sessions. The script refuses to overwrite an unmarked database or reset a database containing students/schools outside the fixture. It uses the production schema, impact factors, and growth rules.

The private device API key lives in `.env.local`; it is not needed for card sign-in. Restart an already-running application after changing environment settings. Use Node 24 for the seeding command.
