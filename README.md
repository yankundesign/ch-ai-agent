# Momentum Design React Starter Kit

This starter repository includes a basic React app setup using [Momentum Design Web Components](https://momentum-design.github.io/momentum-design/en/components/) & [Vite](https://vite.dev/).

- Github repo: <https://github.com/momentum-design/momentum-design>
- NPM Package: <https://www.npmjs.com/package/@momentum-design/components>

## Setup

### Environment Variables

To use the **Ask AI** feature on the Agent Run page, you need to configure an OpenAI API key:

1. Copy `ENV_TEMPLATE` to `.env`:
   ```bash
   cp ENV_TEMPLATE .env
   ```

2. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. Add your API key to the `.env` file:
   ```
   AI_AGENT_API_KEY=sk-your-actual-key-here
   ```

**Important:** Never commit your `.env` file with real API keys to version control. The `.env` file is already in `.gitignore`.

### Ask AI Feature

The Ask AI tab in the Inspector panel provides an interactive chat experience to:
- Explain what the agent does and how it affects users
- Help review proposed setting changes
- Answer questions about transfers and potential impacts
- Provide guidance on when to approve or reject changes

**Note:** The AI assistant is for guidance only and cannot execute changes. All actions (Run, Approve, Reject) must be performed via the Control Panel.

### Backend API Setup

The Ask AI feature requires a backend API to securely proxy requests to OpenAI. The `/api/ask-ai-agent` endpoint is implemented as a serverless function.

**For local development:**
- The API expects the `AI_AGENT_API_KEY` environment variable to be set
- You may need to set up a local serverless function environment (e.g., using Vercel CLI)

**For Vercel deployment:**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set the environment variable:
   ```bash
   vercel env add AI_AGENT_API_KEY
   ```
   Then paste your OpenAI API key when prompted

**For other hosting providers:**
- Ensure your hosting supports Node.js serverless functions or API routes
- Configure the `AI_AGENT_API_KEY` environment variable in your hosting dashboard
- The API handler is located in `/api/ask-ai-agent.ts`


## Caveats

This repository is a Starter Kit only - it is not optimised for production and should not be used for production purposes without adjustments to the build tooling & code.
Vite is bundling all assets like icons, brand-visuals, animations etc as part of the dist without analyzing the exact usage
and which assets are actually required. This has to be fixed as part of making it production ready.

## Current Limitations

Vite is not setup yet to support Lottie JSON files, therefore the "Animation component" is currently not available.
This might get fixed in the future or can be fixed once consuming.

## Notes

### React

This package is built with React 19 and imports React components from Momentum Design directly (from the `/dist/react` distributable). Web Components in Momentum Design are wrapped with [@lit/react](https://lit.dev/docs/frameworks/react/) and reexported in that subfolder.
In React 19 Web Components get better supported and can be used in React directly as well, though the way of importing showcased in this repo is in aligment with older React versions as well.
Both importing React components and using Web Components directly (when using React 19) in a React app are supported by Momentum.

### Imports & Typescript

In this package components are imported from `@momentum-design/components/react`. In Typescript versions older than 4.7 this way of importing is not supported, instead `@momentum-design/components/dist/react` has to be used.
