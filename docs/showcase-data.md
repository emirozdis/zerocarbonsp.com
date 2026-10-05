# Report-backed school showcase

The fixture mirrors the four student profiles in the November 2025 project report.

- Database: `showcase.sqlite` (ignored by Git).
- School: **Yeşil Vadi Deney Okulu**; school ID: `default`.
- Period: **2025-11-03 through 2025-11-28**, weekdays only.
- Usage: **20 lunches per student**, **240 category scans**.
- Baselines: 450 g food, 1800 g CO₂, 500 L embodied water; waste target 15%.

Sign in through “Kartımla giriş” with **TEST001** through **TEST004**. The signed-out preview uses the same report data.

| Test card | Student | Waste | Carbon | Water | Profile | Tree stage |
| --- | --- | ---: | ---: | ---: | --- | --- |
| TEST001 | Öğrenci 1 | 1640 g | 14.95 kg CO₂e | 12427.57 L | Et ürünleri ağırlıklı yüksek çevresel etki | Filiz |
| TEST002 | Öğrenci 2 | 1200 g | 3.13 kg CO₂e | 686.54 L | Sebze ve süt ürünleri ağırlıklı düşük çevresel etki | Fidan |
| TEST003 | Öğrenci 3 | 740 g | 5.31 kg CO₂e | 4246.22 L | Dengeli atık profili ve dönem sonu iyileşme | Fidan |
| TEST004 | Öğrenci 4 | 180 g | 0.702 kg CO₂e | 456.225 L | En düşük gıda israfı ve çevresel etki | Genç ağaç |

Run `npm run seed:showcase` to create the fixture. Rerunning preserves the existing database. To explicitly reset this showcase, use `npm run seed:showcase -- --reset`; reset revokes showcase sessions. The script refuses to overwrite an unmarked database or reset a database containing students/schools outside the fixture. It uses the production schema, report coefficients, and growth rules.

The private device API key lives in `.env.local`; it is not needed for card sign-in. Restart an already-running application after changing environment settings. Use Node 24 for the seeding command.
