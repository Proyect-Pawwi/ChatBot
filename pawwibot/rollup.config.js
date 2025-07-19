import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/app.ts',
  output: {
    file: 'dist/app.js',
    format: 'cjs', // cambia a 'cjs' para mayor compatibilidad en Node.js
    sourcemap: true, // ayuda para debugging
  },
  onwarn: (warning, warn) => {
    // Ignora solo importaciones no resueltas específicas
    if (warning.code === 'UNRESOLVED_IMPORT') return;
    warn(warning);
  },
  plugins: [
    typescript({
      tsconfigOverride: { compilerOptions: { module: "ESNext" } },
      useTsconfigDeclarationDir: true,
    }),
  ],
};
