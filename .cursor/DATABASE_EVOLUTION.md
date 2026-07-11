# Database Evolution Guidelines

## Purpose

This document defines how database schema changes should be handled throughout the project to maintain a clean, consistent, and reviewable migration history.

## General Principles

- Prioritize a clean and maintainable database design over preserving an unfinished schema.
- Every schema modification must be explained before implementation.
- Never make silent database changes.
- Always verify that schema changes remain consistent with `AGENTS.md`.

## Before the Initial Migration

Until the initial migration has been finalized and approved:

- The schema may be refined whenever improvements are identified.
- Tables, columns, relationships, constraints, indexes, and enums may be modified directly.
- Avoid creating unnecessary migration revisions while the schema is still being designed.
- Always explain the proposed changes and obtain approval before implementing them.

## After the Initial Migration

Once the initial migration has been approved or applied:

- Never rewrite or modify existing migration history.
- All database changes must be implemented through new Alembic migrations.
- Existing production-compatible migrations should remain immutable.
- Follow forward-only migration practices.

## When Schema Changes Are Proposed

Before implementing any database change, provide:

- Reason for the change.
- Affected tables.
- Affected columns.
- Relationships impacted.
- Indexes impacted.
- Constraints impacted.
- Data migration requirements (if any).
- Rollback considerations.

Wait for approval before proceeding.

## Schema Review Checklist

Before generating migrations, verify:

- Tables are normalized appropriately.
- Relationships are correct.
- Foreign keys are valid.
- ON DELETE behavior is intentional.
- Required indexes exist.
- Unique constraints are correct.
- CHECK constraints are appropriate.
- ENUM values are still valid.
- Naming conventions remain consistent.
- No duplicate or unused columns exist.

## Migration Guidelines

Every migration should:

- Have a clear descriptive name.
- Upgrade successfully.
- Downgrade successfully.
- Preserve existing data whenever possible.
- Avoid unnecessary destructive operations.

## Breaking Changes

If a proposed schema change is breaking:

- Explain why it is necessary.
- Describe the impact.
- Recommend the safest migration strategy.
- Wait for approval before implementing.

## Goal

Maintain a clean, scalable, and production-ready database design while keeping the migration history consistent and easy to understand.