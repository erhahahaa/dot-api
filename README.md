# DOT Coaching API

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d4492034466245aa8f8be6217c41a753)](https://app.codacy.com/gh/dot-coaching/api/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

A Go language API microservice for handling the business logic of the DOT Coaching server.

## Requirements

To run this server, it is recommended that you use the following configuration:

- [Go 1.22.4](https://go.dev/dl/)
- [Docker](https://docs.docker.com/get-docker/)
- [gofumpt](https://github.com/mvdan/gofumpt?tab=readme-ov-file#gofumpt)

## Installation

- Docker

```bash
  git clone https://github.com/dot-coaching/api.git
  cd api
  cp .env.example .env
  docker compose up -d
```

- VS Code
  ```
  Reopen in container.
  ```

## Contributing

    1. Fork the repository.
    2. Create a new branch (e.g. feature-branch).
    3. Make your changes.
    4. Commit your changes (git commit -m 'Add some feature').
    5. Push to the branch (git push origin feature-branch).
    6. Open a Pull Request.
