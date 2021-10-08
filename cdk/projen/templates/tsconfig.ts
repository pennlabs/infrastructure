export default {
    compilerOptions: {
      "target": "es5",
      "lib": [
        "dom",
        "dom.iterable",
        "esnext"
      ],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": false,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "strictNullChecks": true,
      "strictPropertyInitialization": true,
      "strictBindCallApply": true,
      "baseUrl": ".",
      "paths": {
        "~/*": ["./*"]
      }
    },
    exclude: [
      "node_modules"
    ],
    include: [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx"
    ]
  }