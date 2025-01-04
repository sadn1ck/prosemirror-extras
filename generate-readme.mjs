import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HEADER_MD = `
# ProseMirror Extras

Collection of ProseMirror plugins and utilities
`;

/**
 * Extracts the package details from the package.json file.
 *
 * @param {string} packageName - The name of the package.
 * @returns {{title: string, description: string, relativePath: string}} The package details.
 */
function extractPackageDetails(packageName) {
  const packageJsonPath = join(
    process.cwd(),
    "packages",
    packageName,
    "package.json"
  );
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  return {
    title: packageJson.name,
    description: packageJson?.description ?? "",
    relativePath: `/packages/${packageName}`,
  };
}

function getAllPackageDetails() {
  const packages = readdirSync(join(process.cwd(), "packages"));
  return packages
    .map(extractPackageDetails)
    .filter(Boolean)
    .map(constructPackageDetails)
    .join("\n");
}

/**
 * Constructs the package details for the README.md file.
 *
 * @param {{title: string, description: string, relativePath: string}} packageDetails - The package details.
 * @returns {string} The package details.
 */
function constructPackageDetails(packageDetails) {
  return `
- [${packageDetails.title}](${packageDetails.relativePath})

  > ${packageDetails.description}
`;
}

const packageDetails = getAllPackageDetails();

const BODY_MD = `
## Packages

${packageDetails}
`;

const README_MD = `${HEADER_MD}\n\n${BODY_MD}`;

writeFileSync(join(process.cwd(), "README.md"), README_MD);
