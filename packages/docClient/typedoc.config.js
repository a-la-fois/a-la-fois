module.exports = {
    entryPoints: ['./src/index.ts'],
    out: 'docs',
    excludePrivate: true,
    excludeProtected: true,
    disableSources: true,
    plugin: ['typedoc-plugin-markdown'],
};
