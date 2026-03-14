/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Turbopack that this folder is the project root.
  // This silences the "inferred workspace root" warning caused by a
  // package-lock.json existing in a parent directory.
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
