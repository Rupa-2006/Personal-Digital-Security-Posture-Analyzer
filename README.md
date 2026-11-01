# SecureGuard – Personal Digital Security Posture Analyzer

A browser-based tool that helps people understand how secure their online accounts really are. You can check password strength, find out whether a password has appeared in **real data breaches**, spot password reuse across accounts, track MFA coverage, test suspicious links for phishing signs, and download a PDF report with a security score.

**Privacy first:** there is no backend and no account. Everything runs in your browser and is kept in memory only, so closing the tab clears it. Passwords are never stored.

Built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui.

---

## Features

| Feature | What it does | Real or simulated? |
|---|---|---|
| **Breach Check** | Checks a password against hundreds of millions of leaked passwords using the [Have I Been Pwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords) | ✅ Real, live data |
| **Account Manager** | Add accounts to find reused passwords, missing MFA and breached passwords (checked automatically) | ✅ Real |
| **Password Analyzer** | Scores length, character variety and common patterns, and estimates crack time | ✅ Real (rule-based) |
| **Password Generator** | Generates passwords with the Web Crypto API (`crypto.getRandomValues`) | ✅ Real |
| **Phishing Detector** | Flags look-alike (punycode) domains, brand names on fake domains, the `@` URL trick, raw IPs, plain HTTP and more | ✅ Real (offline heuristics) |
| **Attack Simulator** | Animates a brute-force attack and estimates how long it would take | ⚠️ Estimate (assumes 10 billion guesses/sec) |
| **Footprint Self-Check** | Builds real search links (Google, GitHub, LinkedIn…) and a privacy checklist so you can audit your own public footprint | ✅ Real links, no scraping |
| **Security Tips** | Answers questions about passwords, MFA, phishing, breaches and VPNs | Rule-based keyword matching (not AI) |
| **Security Score, Badges & PDF Report** | Combines everything into a 0–100 score and a downloadable report | ✅ Real |

## Security design decisions

These are the parts I'd point to in a code review. All of them are in [`src/lib/security.ts`](src/lib/security.ts).

### 1. Breach check with k-anonymity
Sending a password to a third-party API would defeat the purpose, so the app uses HIBP's range API:

1. The browser computes `SHA-1(password)`, for example `5BAA61E4C9…`
2. **Only the first 5 hex characters** (`5BAA6`) are sent to `api.pwnedpasswords.com/range/5BAA6`
3. The API returns every leaked hash suffix with that prefix (hundreds of them). The `Add-Padding` header adds fake entries so even the response size reveals nothing.
4. The browser looks for its own suffix locally.

The service never sees the password or its full hash.

### 2. Cryptographically secure password generation
`Math.random()` is a predictable PRNG and must not be used for secrets. The generator uses `crypto.getRandomValues()` with **rejection sampling** to avoid modulo bias. It guarantees at least one character from each selected set and shuffles with Fisher–Yates.

### 3. Detecting password reuse without storing passwords
To tell whether two accounts share a password, the app needs *something* to compare. It stores an **HMAC-SHA-256 fingerprint** whose key is generated randomly per session with `crypto.subtle.generateKey` (non-extractable) and lives only in memory. The fingerprints can't be reversed and can't be compared across sessions. The plain password is discarded right after it's checked.

### 4. Phishing heuristics
- **Homograph attacks:** browsers convert look-alike Unicode domains (e.g. `аpple.com` with a Cyrillic `а`) to punycode `xn--…`, which the detector flags.
- **Brand impersonation:** `paypal-login.example.com` contains "paypal" but isn't on `paypal.com`.
- **Userinfo trick:** in `https://www.sbi.co.in@evil.example/`, the real host is `evil.example`.

## Getting started

Requires Node.js 18+.

```sh
git clone https://github.com/Rupa-2006/Personal-Digital-Security-Posture-Analyzer.git
cd Personal-Digital-Security-Posture-Analyzer
npm install
npm run dev      # http://localhost:8080
npm test         # unit tests for the security logic
npm run build    # production build in dist/
```

## Project structure

```
src/
├── lib/
│   ├── security.ts      # all security logic (breach check, generator, HMAC, phishing rules, scoring)
│   └── store.ts         # in-memory app state (Zustand)
├── pages/               # one file per screen
├── components/          # app components (sidebar, score gauge, cards)
│   └── ui/              # shadcn/ui building blocks
├── hooks/
└── test/
    └── security.test.ts # Vitest unit tests
```

## Limitations and future work

- **Email breach search** needs a paid HIBP API key and a backend to keep that key secret, so the app links to haveibeenpwned.com instead of faking results.
- The strength score is rule-based. Integrating [zxcvbn](https://github.com/dropbox/zxcvbn) would catch dictionary words and keyboard patterns better.
- Phishing detection is heuristic only. A future version could check URLs against Google Safe Browsing.
- Add a Content Security Policy in production, restricting `connect-src` to `api.pwnedpasswords.com`.

## Author

**Sompalli Rupa Sree** – B.Tech CSE (Cyber Security), Madanapalle Institute of Technology and Science
[GitHub](https://github.com/Rupa-2006) · [LinkedIn](https://www.linkedin.com/in/rupa-sree-sompalli-b3558632b)

The UI was first prototyped with Lovable. The security logic was later reworked to use real APIs and the Web Crypto API, and tests were added.
