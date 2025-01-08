# UofCBazaar

## Getting Started

### Prerequisites

- Docker

  Install docker from the
  [Docker Install Page](https://docs.docker.com/engine/install/).

- Deno

  Install deno from
  [Deno Install Page](https://docs.deno.com/runtime/getting_started/installation/),
  if you want to add packages or use it to run docker.

### Installation

1. Clone the repo:

   ```sh
   git clone https://github.com/jasutiin/uofcbazaar.git
   ```

2. Build and run the docker container:

   ```sh
   deno task up
   ```

   or

   ```sh
   docker-compose up -d --build
   ```

3. Access the application:

   You can access the application at `http://localhost:5173`.

   Backend is located at `http://localhost:3000`.

4. Stopping the container:

   ```sh
   deno task down
   ```

   or

   ```sh
   docker-compose down
   ```

## Supabase Database Setup and Seeding

We used the supabase SQL Editor to setup and seed the database with the scripts found
in the `supabase-scripts` folder.
