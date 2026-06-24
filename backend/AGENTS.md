# AGENTS.md - Backend

- Never commit, push, or create PRs unless explicitly asked.
- Read the actual file first. Don't assume you know what's in it.
- After making changes, run `./mvnw spotless:check` and fix formatting before considering done.
- The backend runs in Docker for local development — use `make up` from the project root, not `./mvnw` to run the app.

## Commands

```bash
./mvnw spotless:check         # Check formatting (Google Java Style)
./mvnw spotless:apply         # Auto-fix formatting
./mvnw clean package -DskipTests    # Build JAR (skip tests)
```

## Tech Stack

- Language: Java 21
- Framework: Spring Boot 3.5.9
- Build: Maven (wrapped via `mvnw`)
- Database: PostgreSQL, Flyway (migrations), Spring Data JPA
- Storage: MinIO (via `io.minio:minio`)
- Auth: Spring Security + OAuth2 Resource Server, JWT (jjwt 0.11.5), Google API Client
- API Docs: SpringDoc OpenAPI (springdoc-openapi-starter-webmvc-ui)
- Formatting: Spotless Maven Plugin with Google Java Format (1.17.0, GOOGLE style)
- Boilerplate: Lombok
- Validation: Spring Boot Starter Validation + Bean Validation

## Architecture

Package: `com.acd.researchrepo`

```
src/main/java/com/acd/researchrepo/
├── config/         # Spring configuration classes
├── controller/     # REST controllers
├── dto/            # Data Transfer Objects
├── environment/    # Environment/configuration properties
├── exception/      # Global exception handler + custom exceptions
├── mapper/         # Entity ↔ DTO mappers
├── model/          # JPA entities
├── repository/     # Spring Data JPA repositories
├── security/       # JWT, OAuth2, security config, filters
├── service/        # Business logic
├── spec/           # Specification classes for dynamic queries
├── storage/        # File storage abstraction (local/MinIO)
├── util/           # Utility classes
└── Main.java       # Application entry point

src/main/resources/
├── application.yml            # Base config
├── application-dev.yml        # Dev profile
├── application-prod.yml       # Prod profile
├── application-test.yml       # Test profile
└── db/migration/              # Flyway SQL migrations
```

## Conventions

- Formatting: Google Java Style via Spotless. Run `./mvnw spotless:apply` before pushing.
- Imports: Spotless handles import ordering and unused import removal automatically.
- Entities vs DTOs: Never expose JPA entities directly in API responses. Map to DTOs via mapper layer.
- Lombok: Use `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` for DTOs and entities.
- Migrations: All schema changes go through Flyway migration files in `src/main/resources/db/migration/`.
- Profiles: Use `@Profile("dev")` / `@Profile("prod")` for environment-specific beans.
- No tests yet: The `src/test/` directory doesn't exist. Do not create test files.
- Pre-existing LSP errors: LSP errors in Java files are pre-existing and unrelated to any feature work.
