# M.A.A.N. (मान)
### Metrological Assurance, Authentication & Network
**M.A.A.N.** is an automated regulatory operating system designed to digitize and enforce the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**. It bridges physical calibration with digital trust by eliminating manual field calculations, preventing scale-cloning fraud, and enabling zero-app citizen verification.

---

## ⚙️ Core Architecture & Statutory Engines

* **Algorithmic MPE Tolerance Engine:** Rule-Based MPE Engine: Implements the applicable statutory MPE and verification/inspection test procedures for supported instrument categories, including NAWI Classes I–IV, based on the relevant provisions of the Legal Metrology (General) Rules, 2011.
  Automatically evaluates test loads against true pre-rounding error ($P = I + 0.5e - \Delta L$) and applies the statutory $2\times \text{MPE}$ multiplier for field inspections.
* **Rule 27 Lifecycle State Machine (FSM):** Rule 27 Lifecycle Engine: Automatically determines the applicable reverification interval based on instrument category and applicable statutory/state rules, with support for Rule 27 re-verification triggers following dismantling or repair. Lifecycle Compliance Engine flags instruments requiring re-verification and prevents issuance/continued digital compliance status until the required verification is completed.
  
* **3-Layer Anti-Fraud Hardware Binding:** Helps detect instrument identity mismatches and potential scale-cloning fraud:
  1. *Physical Foil Hologram Sticker ID* (`HOLO-992`)
  2. *Machine-Engraved Metal Chassis Serial* (via on-device Google ML Kit OCR)
  3. *Internal Digital EEPROM Calibration Counter Sync*
* **Zero-Downtime "Day-Forward" Migration:** Resolves the historical paper backlog by migrating active instruments on-demand during routine renewal cycles (`PORTAL_NEW` vs `LEGACY_MIGRATED`).

---

## 🛠️ Technology Stack
* **Frontend:** Next.js 14 App Router + Pure Tailwind CSS (Server-Side Rendered for sub-second mobile loads on 2G/3G networks)
* **Inspector App:** Flutter (Dart) + Hive / SQLite (Offline-first native mobile client with Google ML Kit OCR)
* **Backend:** FastAPI (Python 3.11) + Celery & Redis (00:00 midnight cron workers & reconciliation)
* **Database:** PostgreSQL 16 + PostGIS extension (ACID-compliant Eleventh Schedule ledgers)
* **Integrations:** Bharatkosh / e-GRAS (Treasury webhooks), DigiLocker Push URI API, WhatsApp Cloud API
* **Cloud Infrastructure:** Dockerized microservices engineered for GI Cloud (MeghRaj NIC Cloud)

---

## 📂 Repository Structure
## Project Architecture

The application follows a modular, domain-driven structure adhering to Next.js App Router best practices. Business logic and UI components are strictly separated to ensure the dashboard remains maintainable.

```text
frontend/
├── app/
│   └── inspector/
│       ├── login/page.tsx      # Auth orchestrator
│       └── page.tsx            # Field Inspector dashboard orchestrator
├── components/
│   ├── inspector/              # Domain-specific modules (Modals, Nav, Cards)
│   └── ui/                     # Reusable design system (Buttons, Badges)
├── hooks/                      
│   ├── useInspector.ts         # Centralized state logic for field actions
│   └── useInspectorAuth.ts     # Session and login management
├── lib/                      
│   ├── data.ts                 # Mock fixtures and type definitions
│   └── utils.ts                # Shared helper functions
└── public/
