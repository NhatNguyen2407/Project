# Web Projects

This repository contains my web development work. The main application is Dioxyzine Frog, an e-commerce site for custom plushies, dolls, and accessories.

## Projects

- [Dioxyzine Frog](Working_Projects/Dioxyzine_Frog/README.md) - React storefront with product browsing, inquiries, cart, checkout, account pages, and administration.
- [System inventory](Working_Projects/Dioxyzine_Frog/docs/SYSTEM_INVENTORY.md) - architecture and integration notes.
- [Test plan](Working_Projects/Dioxyzine_Frog/docs/TEST_PLAN.md) - regression checks and verification scope.
- [Recovery readiness](Working_Projects/Dioxyzine_Frog/docs/RECOVERY_READINESS.md) - backup and recovery assessment, including outstanding checks.

## Run the application

The application has its own package manifest and lockfile. Work inside that directory rather than installing from the repository root.

```bash
cd Working_Projects/Dioxyzine_Frog
pnpm install
pnpm dev
```

See the [application README](Working_Projects/Dioxyzine_Frog/README.md) for the full setup, environment variables, tests, and architecture.

## Notes

I use this repository for source code and non-sensitive technical documentation. Live credentials, customer records, payment secrets, database backups, and internal operating data do not belong here. The operational and recovery documents distinguish verified work from checks that are still pending.
