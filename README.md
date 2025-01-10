<div align="center">
  <h1>UofCBazaar</h1>
  <p>A platform for students to conveniently buy and sell items!</p>
</div>

<div align="center">
  <h3>Languages and Tools Used</h3>
  <a href="https://www.typescriptlang.org/" target="blank"><img alt="Typescript" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" /></a>
  <a href="https://react.dev/" target="blank"><img alt="React" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" /></a>
  <a href="https://tailwindcss.com/" target="blank"><img alt="Tailwind" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" /></a>
  <a href="https://deno.com/" target="blank"><img alt="Deno" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg" /></a>
  <a href="https://supabase.com/" target="blank"><img alt="Supabase" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" /></a>
  <a href="https://www.docker.com/" target="blank"><img alt="Docker" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" /></a>
</div>

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

## Contributors
Made by Justine Mangaliman, Dante Kirsman, Kyle Ontiveros, Mohammad Khan, Tiffany Okura
