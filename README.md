# Terpwushu website
This is the repository for the University of Maryland Terpwushu club website (updated August 2026 by Josh Zhu). 

The sourcecode for the webpages are in /src. Images and some other files are in /public 

The site is now hosted via AWS s3, with AWS DynamoDB and Lambda for backend server (mostly for admin + UWG stuff). 

To start frontend local dev: npm run dev

<<<<<<< HEAD
To start backend local dev: cd server && node local.js (needs server/.env populated — see server/.env.example)

Backend is Node/Express on AWS Lambda via SAM (see template.yaml). To deploy: sam build && sam deploy --guided
=======
~~To start backend PostgreSQL stuff: npx supabase start~~
I used PostgreSQL via supabase during local dev, all that has been migrated to AWS Cloud.
>>>>>>> a8126f8bdba37c57ea90a0c58b40ca8037b7bf07

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
