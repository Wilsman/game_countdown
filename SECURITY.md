# Security

Please don't open a public issue for security problems. Report them privately
through [GitHub security advisories](https://github.com/Wilsman/game_countdown/security/advisories/new).

Secrets, such as the Twitch client secret used by the IGDB proxy, live only in
Cloudflare environment variables and local `.dev.vars` files. They must never
be committed or bundled into client code.
