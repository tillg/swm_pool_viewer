![A12](./A12_logo.png)

# Widgets

Containing the A12 Widgets library, utility components, and interactive showcase applications for building modern web applications with React.

Refer to https://geta12.com/#/docs to get started with A12 development

---

## Getting Started

### How to Use It

#### Import & Install

For detailed documentation on components and usage, please visit the [widgets-showcase](https://www.mgm-tp.com/a12.htmlshowcase/index.html#/).

To use the widgets in your project:

```sh
npm install @com.mgmtp.a12.widgets/widgets-core
```

### How to Build and Run

#### Prerequisites

The following tools are required in order to build this repository:

| Tool                        | Version |
| --------------------------- | ------: |
| [Node](https://nodejs.org/) |  `24.x` |
| [pnpm](https://pnpm.io/)    |  `10.x` |

#### How to Build

Install all dependencies and link local packages:

```sh
pnpm install
```

Build all packages:

```sh
pnpm compile
```

This will execute the build in all packages, which includes:

- Compiling TypeScript source in `core` and `utils` to JavaScript
- Bundle the showcase using Rsbuild

#### How to Test

Run tests in all packages:

```sh
pnpm test
```

#### How to Run

Start the development environment:

```sh
pnpm start
```

This will start the dev server and TypeScript compiler in watch mode. This is the recommended way to start developing instead of starting individual packages.

#### How to Access It

Once running, open your browser and navigate to:

- **Showcase**: <http://localhost:5555>

#### How to Clean and Format

Remove all build artifacts:

```sh
pnpm clean
```

Run linting:

```sh
pnpm lint
```

Fix linting issues:

```sh
pnpm format
```

---

### Documentation

- Full technical documentation is available at [GetA12.com](https://GetA12.com).
- The website also provides access to the **A12 Discourse Community Forum**.

---

**The mgm A12 Team**

[mgm technology partners GmbH](https://www.mgm-tp.com) • [Imprint](https://www.mgm-tp.com/imprint.html)