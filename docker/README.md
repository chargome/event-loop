Docker services

- Postgres 16 for local development

Commands

- Start: `docker compose -f docker/compose.yml up -d`
- Stop: `docker compose -f docker/compose.yml down`
- Logs: `docker compose -f docker/compose.yml logs -f postgres`

Connection

- URL: `postgres://eventloop:eventloop@localhost:5432/eventloop`
