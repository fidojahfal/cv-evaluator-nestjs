<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

CV Evaluator using NestJS + LLM (Langchain + HuggingFace + Groq).

## Project setup

```bash
# Install depedency
$ npm install

# Copy file environment
$ cp .env.example .env

# Run container Docker (PostgreSQL, Redis, Chroma)
$ docker-compose up -d

# Generate prisma client
$ npx prisma generate

# Run database migration
$ prisma migrate dev

# Run script for ingest document ground truth
$ npx ts-node src/common/scripts/ingest-documents.ts

# Run the application NestJS
# Development
$ npm run start

# Production
$ npm run build
$ npm run start:prod
```

## API Endpoint

### 1. Upload

#### Endpoint

```bash
POST /upload
```

#### Request

#### Response

```bash
{
    "cv": {
        "id": 1,
        "name": "1759940675889-720558134-CV.pdf"
    },
    "project_report": {
        "id": 2,
        "name": "1759940675891-179043711-Study Case Submission.pdf"
    }
}
```

### 2. Evaluate

#### Endpoint

```bash
POST /evaluate
```

#### Request

```bash
{
    "cv_id": 7,
    "project_report_id": 8,
    "job_title": "Backend Engineer"
}
```

#### Response

```bash
{
    "id": 1,
    "status": "queued"
}
```

### 3. Result

#### Endpoint

```bash
POST /result/:id
```

#### Request

#### Response

```bash
# Queued
{
    "id": 1,
    "status": "queued"
}

# Processing
{
    "id": 1,
    "status": "queued"
}

# Error
{
    "id": 39,
    "status": "completed",
    "result": {
        "error_message": "The error message show here"
    }
}

# Complete
{
    "id": 39,
    "status": "completed",
    "result": {
        "cv_feedback": "The candidate has a strong technical background and relevant experience in web development. Their projects demonstrate a good understanding of full-stack development and various technologies. However, the CV lacks specific details about their contributions to each project and could benefit from quantifiable achievements.",
        "cv_match_rate": 0.75,
        "project_score": 3.8,
        "overall_summary": "The candidate shows promise for a backend engineer role with a solid technical background and relevant project experience. While their CV lacks specific project contributions and quantifiable achievements, their project demonstrates good understanding and implementation of key features.  Areas for improvement include code optimization, documentation, and providing more detailed project descriptions in their CV.",
        "project_feedback": "The project demonstrates a good understanding of the requirements and implements the key features effectively. The code is well-structured and easy to understand. However, there is room for improvement in terms of code optimization and documentation."
    }
}
```
